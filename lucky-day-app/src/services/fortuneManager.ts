/**
 * Fortune Manager Service
 * Handles fortune generation, caching, and 24-hour cooldown logic
 * Implements requirements 1.4, 1.5, 7.1 for fortune management
 */

import { Fortune, calculateFortuneExpiration, DecorativeElements, canGenerateFortuneToday, getNext8amLocalTime } from '../types/fortune';
import { AstrologicalProfile } from '../types/astrology';
import { AppStorage } from '../utils/storage';
import { llmService } from './llm';

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

    const state = {
      currentFortune: this.currentFortune,
      lastFortuneDate: this.lastFortuneDate,
      canGenerateNew,
      timeUntilNext
    };

    console.log('FortuneManager.getFortuneState():', {
      hasFortune: !!this.currentFortune,
      fortuneId: this.currentFortune?.id,
      fortuneSource: this.currentFortune?.source,
      canGenerateNew,
      timeUntilNext,
      lastFortuneDate: this.lastFortuneDate
    });

    return state;
  }

  /**
   * Check if a new fortune can be generated (daily reset at 8am local time)
   */
  public canGenerateNewFortune(): boolean {
    // If no fortune exists, can generate
    if (!this.currentFortune || !this.lastFortuneDate) {
      return true;
    }

    // If current fortune is a connectivity error, can always try again
    if (this.currentFortune.source === 'connectivity_error') {
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

        console.log('Successfully generated AI fortune');

      } catch (error) {
        console.warn('LLM fortune generation failed, showing connectivity message:', error);
        
        // Generate connectivity error message instead of consuming daily fortune
        // This allows users to try again when back online
        fortune = this.generateConnectivityErrorFortune(profile, now);
        
        console.log('Generated connectivity error message due to LLM failure');
      }

      // Handle different fortune types
      if (fortune.source === 'ai') {
        // Cache AI fortunes and update state
        await this.cacheFortune(fortune);
        
        // Update tracking
        this.currentFortune = fortune;
        this.lastFortuneDate = now;
        this.addToPreviousFortunes(fortune.message);

        // Update app state
        await this.updateAppState();
        
        console.log('AI fortune cached and state updated');
      } else if (fortune.source === 'connectivity_error') {
        // For connectivity errors, update current fortune but don't cache or consume quota
        this.currentFortune = fortune;
        console.log('Connectivity error fortune set (not cached, quota not consumed)');
      }

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
   * Get connectivity error fortune for any scenario where LLM is unavailable
   * This replaces the old "offline fallback" concept since they're the same thing
   */
  public getConnectivityErrorFortune(profile: AstrologicalProfile): Fortune {
    const now = new Date();
    return this.generateConnectivityErrorFortune(profile, now);
  }

  /**
   * Check if the app is in offline mode (no network connection)
   * This is a placeholder - actual network detection would be implemented in the UI layer
   */
  public isOfflineMode(): boolean {
    // This would be implemented with actual network detection
    // For now, return false as this is handled by LLM service timeouts
    return false;
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
   * Check if a fortune is a connectivity error (Wi-Fi message)
   */
  public static isConnectivityError(fortune: Fortune): boolean {
    return fortune.source === 'connectivity_error';
  }

  /**
   * Check if fortune is expired
   */
  private isFortuneExpired(fortune: Fortune): boolean {
    const now = new Date();
    return now >= fortune.expiresAt;
  }

  /**
   * Generate connectivity error message when LLM is unavailable
   * This doesn't consume the daily fortune quota, allowing users to try again when back online
   */
  private generateConnectivityErrorFortune(profile: AstrologicalProfile, generatedAt: Date): Fortune {
    return {
      id: this.generateFortuneId(),
      message: "Even fortune cookies need Wi-Fi. Come back when the stars (and your connection) align!",
      generatedAt,
      expiresAt: new Date(generatedAt.getTime() + 5 * 60 * 1000), // Expires in 5 minutes
      source: 'connectivity_error',
      decorativeElements: {
        ideogram: "📶", // Wi-Fi symbol as ideogram
        signature: "Tech Support Oracle"
      }
    };
  }



  /**
   * Generate decorative elements based on profile
   */
  private generateDecorativeElements(profile: AstrologicalProfile): DecorativeElements {
    // Map zodiac animals to ideograms with alternates for variety
    const zodiacIdeograms: Record<string, string[]> = {
      rat: ['鼠', '子', '智'],
      ox: ['牛', '丑', '力'], 
      tiger: ['虎', '寅', '勇'],
      rabbit: ['兔', '卯', '柔'],
      dragon: ['龍', '辰', '威'],
      snake: ['蛇', '巳', '慧'],
      horse: ['馬', '午', '速'],
      goat: ['羊', '未', '和'],
      monkey: ['猴', '申', '靈'],
      rooster: ['雞', '酉', '明'],
      dog: ['狗', '戌', '忠'],
      pig: ['豬', '亥', '福']
    };

    // Element-based ideograms for additional variety
    const elementIdeograms: Record<string, string[]> = {
      wood: ['木', '森', '生'],
      fire: ['火', '炎', '光'],
      earth: ['土', '山', '穩'],
      metal: ['金', '鐵', '堅'],
      water: ['水', '海', '流']
    };

    // Auspicious signature characters
    const signatureElements = [
      '運命', '天機', '星象', '易經', '太極', '陰陽', 
      '五行', '八卦', '乾坤', '風水', '命理', '玄機'
    ];

    // Select ideogram (prefer zodiac, fallback to element, then auspicious)
    const zodiacOptions = zodiacIdeograms[profile.zodiac.animal] || ['福'];
    const elementOptions = elementIdeograms[profile.zodiac.element] || ['吉'];
    
    // Use date-based selection for consistency within the day
    const today = new Date().toDateString();
    const seed = this.hashString(today + profile.zodiac.animal);
    
    const ideogramPool = [...zodiacOptions, ...elementOptions, '福', '吉', '祥', '運'];
    const selectedIdeogram = ideogramPool[seed % ideogramPool.length];

    // Generate signature with mystical elements
    const signatureElement = signatureElements[seed % signatureElements.length];
    const signature = `${signatureElement}`;

    return {
      ideogram: selectedIdeogram,
      signature
    };
  }

  /**
   * Simple hash function for consistent daily selection
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
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