/**
 * Fortune Manager Service
 * Handles fortune generation, caching, and 24-hour cooldown logic
 * Implements requirements 1.4, 1.5, 7.1 for fortune management
 */

import { Fortune, calculateFortuneExpiration, DecorativeElements, canGenerateFortuneToday, getNext8amLocalTime } from '../types/fortune';
import { AstrologicalProfile } from '../types/astrology';
import { AppStorage } from '../utils/storage';
import { llmService, LLMError, LLMErrorType } from './llm';

/**
 * Fortune Manager error types
 */
export enum FortuneManagerErrorType {
  COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
  NO_PROFILE = 'NO_PROFILE',
  GENERATION_FAILED = 'GENERATION_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

export class FortuneManagerError extends Error {
  constructor(
    public type: FortuneManagerErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FortuneManagerError';
  }
}

/**
 * Fortune generation state
 */
export interface FortuneState {
  /** Current cached fortune, null if none */
  currentFortune: Fortune | null;
  /** Date when last fortune was generated */
  lastFortuneDate: Date | null;
  /** Whether a new fortune can be generated */
  canGenerateNew: boolean;
  /** Time remaining until next fortune (in milliseconds) */
  timeUntilNext: number;
}

/**
 * Fallback fortune database
 * Used when LLM is unavailable or fails
 */
const FALLBACK_FORTUNES: Array<{ message: string; ideogram: string; signature: string }> = [
  {
    message: "Today's path reveals itself to those who walk with patience and wisdom.",
    ideogram: "智",
    signature: "Ancient Wisdom"
  },
  {
    message: "Like bamboo in the wind, flexibility brings strength to your endeavors.",
    ideogram: "柔",
    signature: "Master of Adaptation"
  },
  {
    message: "The dragon within you stirs; let your inner fire illuminate new possibilities.",
    ideogram: "龍",
    signature: "Dragon's Heart"
  },
  {
    message: "Water finds its way around obstacles; so too shall your spirit flow forward.",
    ideogram: "水",
    signature: "River's Teaching"
  },
  {
    message: "In stillness, the mind discovers what motion cannot reveal.",
    ideogram: "靜",
    signature: "Silent Master"
  },
  {
    message: "Today's small steps create tomorrow's great journey.",
    ideogram: "步",
    signature: "Path Walker"
  },
  {
    message: "The wise person learns from every season; what does today teach you?",
    ideogram: "學",
    signature: "Eternal Student"
  },
  {
    message: "Your inner light shines brightest when shared with others.",
    ideogram: "光",
    signature: "Light Bearer"
  },
  {
    message: "Like the phoenix, transformation brings renewal to your spirit.",
    ideogram: "鳳",
    signature: "Phoenix Rising"
  },
  {
    message: "Balance is not stillness, but harmony in motion.",
    ideogram: "和",
    signature: "Harmony Keeper"
  }
];

/**
 * Fortune Manager Class
 * Manages fortune generation, caching, and cooldown logic
 */
export class FortuneManager {
  private static instance: FortuneManager;
  private currentFortune: Fortune | null = null;
  private lastFortuneDate: Date | null = null;
  private previousFortunes: string[] = [];

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FortuneManager {
    if (!FortuneManager.instance) {
      FortuneManager.instance = new FortuneManager();
    }
    return FortuneManager.instance;
  }

  /**
   * Initialize the fortune manager by loading cached data
   */
  public async initialize(): Promise<void> {
    try {
      // Load current fortune from storage
      this.currentFortune = await AppStorage.loadFortune();
      
      // Load app state to get last fortune date
      const appState = await AppStorage.loadAppState();
      this.lastFortuneDate = appState?.lastFortuneDate || null;

      // Clean up expired fortune
      if (this.currentFortune && this.isFortuneExpired(this.currentFortune)) {
        await this.clearExpiredFortune();
      }

    } catch (error) {
      console.warn('Failed to initialize FortuneManager:', error);
      // Continue with empty state if initialization fails
      this.currentFortune = null;
      this.lastFortuneDate = null;
    }
  }

  /**
   * Get current fortune state
   */
  public getFortuneState(): FortuneState {
    const now = new Date();
    const canGenerateNew = this.canGenerateNewFortune();
    
    let timeUntilNext = 0;
    if (!canGenerateNew) {
      const next8am = getNext8amLocalTime(now);
      timeUntilNext = Math.max(0, next8am.getTime() - now.getTime());
    }

    return {
      currentFortune: this.currentFortune,
      lastFortuneDate: this.lastFortuneDate,
      canGenerateNew,
      timeUntilNext
    };
  }

  /**
   * Check if a new fortune can be generated (daily reset at 8am local time)
   */
  public canGenerateNewFortune(): boolean {
    // If no fortune exists, can generate
    if (!this.currentFortune || !this.lastFortuneDate) {
      return true;
    }

    // If current fortune is expired, can generate
    if (this.isFortuneExpired(this.currentFortune)) {
      return true;
    }

    // Check if we're in a new daily window (8am local time reset)
    return canGenerateFortuneToday(new Date(), this.lastFortuneDate);
  }

  /**
   * Generate a new fortune for the given profile
   */
  public async generateFortune(profile: AstrologicalProfile): Promise<Fortune> {
    if (!profile) {
      throw new FortuneManagerError(
        FortuneManagerErrorType.NO_PROFILE,
        'No astrological profile provided'
      );
    }

    if (!this.canGenerateNewFortune()) {
      throw new FortuneManagerError(
        FortuneManagerErrorType.COOLDOWN_ACTIVE,
        'Fortune cooldown is active. Please wait 24 hours between fortunes.'
      );
    }

    try {
      const now = new Date();
      let fortune: Fortune;

      // Try to generate with LLM first
      try {
        const message = await llmService.generateFortune(profile, this.previousFortunes);
        const decorativeElements = this.generateDecorativeElements(profile);
        
        fortune = {
          id: this.generateFortuneId(),
          message,
          generatedAt: now,
          expiresAt: calculateFortuneExpiration(now),
          source: 'ai',
          decorativeElements
        };

      } catch (error) {
        console.warn('LLM fortune generation failed, using fallback:', error);
        
        // Use fallback fortune
        fortune = this.generateFallbackFortune(profile, now);
      }

      // Cache the fortune
      await this.cacheFortune(fortune);
      
      // Update tracking
      this.currentFortune = fortune;
      this.lastFortuneDate = now;
      this.addToPreviousFortunes(fortune.message);

      // Update app state
      await this.updateAppState();

      return fortune;

    } catch (error) {
      if (error instanceof FortuneManagerError) {
        throw error;
      }
      
      throw new FortuneManagerError(
        FortuneManagerErrorType.GENERATION_FAILED,
        `Failed to generate fortune: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get cached fortune if available and not expired
   */
  public getCachedFortune(): Fortune | null {
    if (!this.currentFortune) {
      return null;
    }

    if (this.isFortuneExpired(this.currentFortune)) {
      // Clean up expired fortune
      this.clearExpiredFortune().catch(error => {
        console.warn('Failed to clear expired fortune:', error);
      });
      return null;
    }

    return this.currentFortune;
  }

  /**
   * Force refresh fortune (bypass cooldown - for testing/admin)
   */
  public async forceRefreshFortune(profile: AstrologicalProfile): Promise<Fortune> {
    // Temporarily clear cooldown
    const originalDate = this.lastFortuneDate;
    this.lastFortuneDate = null;
    this.currentFortune = null;

    try {
      return await this.generateFortune(profile);
    } catch (error) {
      // Restore original state on failure
      this.lastFortuneDate = originalDate;
      throw error;
    }
  }

  /**
   * Clear current fortune and reset state
   */
  public async clearFortune(): Promise<void> {
    try {
      this.currentFortune = null;
      this.lastFortuneDate = null;
      
      await AppStorage.removeFortune();
      await this.updateAppState();
      
    } catch (error) {
      throw new FortuneManagerError(
        FortuneManagerErrorType.STORAGE_ERROR,
        `Failed to clear fortune: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get time until next fortune is available (in milliseconds)
   */
  public getTimeUntilNextFortune(): number {
    if (this.canGenerateNewFortune()) {
      return 0;
    }

    const now = new Date();
    const next8am = getNext8amLocalTime(now);
    
    return Math.max(0, next8am.getTime() - now.getTime());
  }

  /**
   * Get formatted time until next fortune
   */
  public getFormattedTimeUntilNext(): string {
    const milliseconds = this.getTimeUntilNextFortune();
    
    if (milliseconds === 0) {
      return 'Available now';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Check if fortune is expired
   */
  private isFortuneExpired(fortune: Fortune): boolean {
    const now = new Date();
    return now >= fortune.expiresAt;
  }

  /**
   * Generate fallback fortune when LLM is unavailable
   */
  private generateFallbackFortune(profile: AstrologicalProfile, generatedAt: Date): Fortune {
    // Select a random fallback fortune
    const randomIndex = Math.floor(Math.random() * FALLBACK_FORTUNES.length);
    const fallback = FALLBACK_FORTUNES[randomIndex];

    return {
      id: this.generateFortuneId(),
      message: fallback.message,
      generatedAt,
      expiresAt: calculateFortuneExpiration(generatedAt),
      source: 'fallback',
      decorativeElements: {
        ideogram: fallback.ideogram,
        signature: fallback.signature
      }
    };
  }

  /**
   * Generate decorative elements based on profile
   */
  private generateDecorativeElements(profile: AstrologicalProfile): DecorativeElements {
    // Map zodiac animals to ideograms
    const zodiacIdeograms: Record<string, string> = {
      rat: '鼠',
      ox: '牛', 
      tiger: '虎',
      rabbit: '兔',
      dragon: '龍',
      snake: '蛇',
      horse: '馬',
      goat: '羊',
      monkey: '猴',
      rooster: '雞',
      dog: '狗',
      pig: '豬'
    };

    // Generate signature based on mystical nickname
    const signature = `${profile.mysticalNickname} • ${new Date().getFullYear()}`;

    return {
      ideogram: zodiacIdeograms[profile.zodiac.animal] || '福',
      signature
    };
  }

  /**
   * Generate unique fortune ID
   */
  private generateFortuneId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `fortune_${timestamp}_${random}`;
  }

  /**
   * Cache fortune to storage
   */
  private async cacheFortune(fortune: Fortune): Promise<void> {
    try {
      await AppStorage.saveFortune(fortune);
    } catch (error) {
      throw new FortuneManagerError(
        FortuneManagerErrorType.CACHE_ERROR,
        `Failed to cache fortune: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Clear expired fortune from cache
   */
  private async clearExpiredFortune(): Promise<void> {
    this.currentFortune = null;
    await AppStorage.removeFortune();
  }

  /**
   * Add fortune message to previous fortunes for variety
   */
  private addToPreviousFortunes(message: string): void {
    this.previousFortunes.push(message);
    
    // Keep only last 5 fortunes for variety checking
    if (this.previousFortunes.length > 5) {
      this.previousFortunes = this.previousFortunes.slice(-5);
    }
  }

  /**
   * Update app state with current fortune data
   */
  private async updateAppState(): Promise<void> {
    try {
      const currentState = await AppStorage.loadAppState();
      
      const updatedState = {
        profile: currentState?.profile || null,
        currentFortune: this.currentFortune,
        lastFortuneDate: this.lastFortuneDate,
        settings: currentState?.settings || {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: (currentState?.analytics?.fortunesGenerated || 0) + 1,
          appOpens: currentState?.analytics?.appOpens || 0,
          lastActiveDate: new Date()
        }
      };

      await AppStorage.saveAppState(updatedState);
      
    } catch (error) {
      console.warn('Failed to update app state:', error);
      // Don't throw here as this is not critical for fortune generation
    }
  }
}

// Export singleton instance
export const fortuneManager = FortuneManager.getInstance();