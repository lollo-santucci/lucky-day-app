/**
 * Unit tests for FortuneManager
 * Tests fortune caching, cooldown logic, and expiration handling
 */

import { FortuneManager, FortuneManagerError, FortuneManagerErrorType } from '../fortuneManager';
import { AppStorage } from '../../utils/storage';
import { llmService } from '../llm';
import { AstrologicalProfile } from '../../types/astrology';
import { Fortune, calculateFortuneExpiration, canGenerateFortuneToday, getNext8amLocalTime } from '../../types/fortune';

// Mock dependencies
jest.mock('../../utils/storage');

// Mock the LLM service
jest.mock('../llm', () => ({
  llmService: {
    generateFortune: jest.fn()
  }
}));

const mockAppStorage = AppStorage as jest.Mocked<typeof AppStorage>;
const mockLlmService = llmService as jest.Mocked<typeof llmService>;

describe('FortuneManager', () => {
  let fortuneManager: FortuneManager;
  let mockProfile: AstrologicalProfile;

  beforeEach(() => {
    // Reset singleton instance for each test
    (FortuneManager as any).instance = undefined;
    fortuneManager = FortuneManager.getInstance();

    // Mock profile
    mockProfile = {
      zodiac: {
        animal: 'dragon',
        element: 'fire',
        year: 2000
      },
      pillars: {
        year: { stem: '庚', branch: '辰', element: 'metal' },
        month: { stem: '戊', branch: '寅', element: 'earth' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      },
      mysticalNickname: 'Wise Dragon',
      pillarDescriptions: {
        year: 'Your destiny flows like molten gold',
        month: 'Your environment nurtures transformation',
        day: 'Your essence burns with creative fire',
        hour: 'Your inner heart beats with ancient wisdom'
      },
      essenceSummary: 'Born under the fire dragon, you carry the wisdom of transformation\nYour pillars dance between metal and fire, creating harmony in purpose\nIn your heart flows the eternal flame of destiny, guiding you toward greatness'
    };

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockAppStorage.loadFortune.mockResolvedValue(null);
    mockAppStorage.loadAppState.mockResolvedValue(null);
    mockAppStorage.saveFortune.mockResolvedValue();
    mockAppStorage.saveAppState.mockResolvedValue();
    mockAppStorage.removeFortune.mockResolvedValue();
    
    mockLlmService.generateFortune.mockResolvedValue('Today brings new opportunities for growth and wisdom.');
  });

  describe('Initialization', () => {
    it('should initialize with empty state when no cached data exists', async () => {
      await fortuneManager.initialize();
      
      const state = fortuneManager.getFortuneState();
      expect(state.currentFortune).toBeNull();
      expect(state.lastFortuneDate).toBeNull();
      expect(state.canGenerateNew).toBe(true);
      expect(state.timeUntilNext).toBe(0);
    });

    it('should load cached fortune on initialization', async () => {
      const cachedFortune: Fortune = {
        id: 'test_fortune_1',
        message: 'Cached fortune message',
        generatedAt: new Date(),
        expiresAt: calculateFortuneExpiration(new Date()),
        source: 'ai',
        decorativeElements: {
          ideogram: '龍',
          signature: 'Wise Dragon • 2024'
        }
      };

      const appState = {
        profile: mockProfile,
        currentFortune: cachedFortune,
        lastFortuneDate: new Date(),
        settings: {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: 1,
          appOpens: 5,
          lastActiveDate: new Date()
        }
      };

      mockAppStorage.loadFortune.mockResolvedValue(cachedFortune);
      mockAppStorage.loadAppState.mockResolvedValue(appState);

      await fortuneManager.initialize();
      
      const state = fortuneManager.getFortuneState();
      expect(state.currentFortune).toEqual(cachedFortune);
      expect(state.lastFortuneDate).toEqual(appState.lastFortuneDate);
    });

    it('should clear expired fortune on initialization', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 2); // 2 days ago

      const expiredFortune: Fortune = {
        id: 'expired_fortune',
        message: 'Expired fortune',
        generatedAt: expiredDate,
        expiresAt: calculateFortuneExpiration(expiredDate),
        source: 'ai',
        decorativeElements: {
          ideogram: '龍',
          signature: 'Test'
        }
      };

      mockAppStorage.loadFortune.mockResolvedValue(expiredFortune);

      await fortuneManager.initialize();
      
      expect(mockAppStorage.removeFortune).toHaveBeenCalled();
      
      const state = fortuneManager.getFortuneState();
      expect(state.currentFortune).toBeNull();
    });
  });

  describe('Cooldown Logic', () => {
    it('should allow fortune generation when no previous fortune exists', () => {
      expect(fortuneManager.canGenerateNewFortune()).toBe(true);
    });

    it('should prevent fortune generation within same day (before next 8am)', async () => {
      // Mock current time to be 10am
      const mockNow = new Date();
      mockNow.setHours(10, 0, 0, 0);
      jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime());
      
      // Generate first fortune
      const fortune = await fortuneManager.generateFortune(mockProfile);
      expect(fortune).toBeDefined();
      
      // Should not be able to generate another on same day
      expect(fortuneManager.canGenerateNewFortune()).toBe(false);
      
      // Should throw error when trying to generate
      await expect(fortuneManager.generateFortune(mockProfile))
        .rejects.toThrow(FortuneManagerError);
        
      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should allow fortune generation after 8am next day', async () => {
      // Mock a fortune generated yesterday at 10am
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      yesterdayDate.setHours(10, 0, 0, 0);

      const oldFortune: Fortune = {
        id: 'old_fortune',
        message: 'Old fortune',
        generatedAt: yesterdayDate,
        expiresAt: calculateFortuneExpiration(yesterdayDate),
        source: 'ai',
        decorativeElements: {
          ideogram: '龍',
          signature: 'Test'
        }
      };

      const appState = {
        profile: mockProfile,
        currentFortune: oldFortune,
        lastFortuneDate: yesterdayDate,
        settings: {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: 1,
          appOpens: 5,
          lastActiveDate: new Date()
        }
      };

      // Mock current time to be today at 9am (after 8am reset)
      const mockNow = new Date();
      mockNow.setHours(9, 0, 0, 0);
      jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime());

      mockAppStorage.loadFortune.mockResolvedValue(oldFortune);
      mockAppStorage.loadAppState.mockResolvedValue(appState);

      await fortuneManager.initialize();
      
      // Should be able to generate new fortune
      expect(fortuneManager.canGenerateNewFortune()).toBe(true);
      
      const newFortune = await fortuneManager.generateFortune(mockProfile);
      expect(newFortune).toBeDefined();
      expect(newFortune.id).not.toBe(oldFortune.id);
      
      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should calculate correct time until next 8am', async () => {
      // Generate fortune (this will set the cooldown)
      await fortuneManager.generateFortune(mockProfile);
      
      const timeUntilNext = fortuneManager.getTimeUntilNextFortune();
      
      // Should be some positive time until next 8am (less than 24 hours)
      expect(timeUntilNext).toBeGreaterThan(0);
      expect(timeUntilNext).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // Less than 24 hours
    });

    it('should format time until next 8am correctly', async () => {
      // Mock current time to be 6pm today
      const mockNow = new Date();
      mockNow.setHours(18, 30, 0, 0); // 6:30pm
      jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime());
      
      await fortuneManager.generateFortune(mockProfile);
      
      const formatted = fortuneManager.getFormattedTimeUntilNext();
      
      // Should show hours and minutes (should be around 13h 30m until 8am)
      expect(formatted).toMatch(/^\d{1,2}h \d{1,2}m$/);
      
      // Restore Date.now
      jest.restoreAllMocks();
    });
  });

  describe('Fortune Caching', () => {
    it('should cache generated fortune to storage', async () => {
      const fortune = await fortuneManager.generateFortune(mockProfile);
      
      expect(mockAppStorage.saveFortune).toHaveBeenCalledWith(fortune);
      expect(mockAppStorage.saveAppState).toHaveBeenCalled();
    });

    it('should return cached fortune when available', async () => {
      const fortune = await fortuneManager.generateFortune(mockProfile);
      
      const cached = fortuneManager.getCachedFortune();
      expect(cached).toEqual(fortune);
    });

    it('should return null for expired cached fortune', async () => {
      // Create expired fortune
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 2);

      const expiredFortune: Fortune = {
        id: 'expired',
        message: 'Expired',
        generatedAt: expiredDate,
        expiresAt: calculateFortuneExpiration(expiredDate),
        source: 'ai',
        decorativeElements: {
          ideogram: '龍',
          signature: 'Test'
        }
      };

      // Manually set expired fortune
      (fortuneManager as any).currentFortune = expiredFortune;
      
      const cached = fortuneManager.getCachedFortune();
      expect(cached).toBeNull();
    });

    it('should clear fortune from cache and storage', async () => {
      await fortuneManager.generateFortune(mockProfile);
      
      await fortuneManager.clearFortune();
      
      expect(mockAppStorage.removeFortune).toHaveBeenCalled();
      expect(fortuneManager.getCachedFortune()).toBeNull();
    });
  });

  describe('Fortune Expiration', () => {
    it('should allow new fortune generation when current fortune is expired', async () => {
      // Create expired fortune
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 2);

      const expiredFortune: Fortune = {
        id: 'expired',
        message: 'Expired',
        generatedAt: expiredDate,
        expiresAt: calculateFortuneExpiration(expiredDate),
        source: 'ai',
        decorativeElements: {
          ideogram: '龍',
          signature: 'Test'
        }
      };

      // Set up state with expired fortune
      (fortuneManager as any).currentFortune = expiredFortune;
      (fortuneManager as any).lastFortuneDate = expiredDate;
      
      expect(fortuneManager.canGenerateNewFortune()).toBe(true);
      
      const newFortune = await fortuneManager.generateFortune(mockProfile);
      expect(newFortune.id).not.toBe(expiredFortune.id);
    });
  });

  describe('Connectivity Error Handling', () => {
    it('should show Wi-Fi message when LLM fails', async () => {
      mockLlmService.generateFortune.mockRejectedValue(new Error('LLM failed'));
      
      const fortune = await fortuneManager.generateFortune(mockProfile);
      
      expect(fortune.source).toBe('connectivity_error');
      expect(fortune.message).toBe("Even fortune cookies need Wi-Fi. Come back when the stars (and your connection) align!");
      expect(fortune.decorativeElements.ideogram).toBe("📶");
      expect(fortune.decorativeElements.signature).toBe("Tech Support Oracle");
    });

    it('should allow retry after connectivity error', async () => {
      // First call fails
      mockLlmService.generateFortune.mockRejectedValueOnce(new Error('LLM failed'));
      
      const errorFortune = await fortuneManager.generateFortune(mockProfile);
      expect(errorFortune.source).toBe('connectivity_error');
      
      // Should be able to try again immediately
      expect(fortuneManager.canGenerateNewFortune()).toBe(true);
      
      // Second call succeeds
      mockLlmService.generateFortune.mockResolvedValueOnce('Success message');
      const successFortune = await fortuneManager.generateFortune(mockProfile);
      expect(successFortune.source).toBe('ai');
    });

    it('should not consume daily fortune quota for connectivity errors', async () => {
      mockLlmService.generateFortune.mockRejectedValue(new Error('LLM failed'));
      
      const errorFortune = await fortuneManager.generateFortune(mockProfile);
      expect(errorFortune.source).toBe('connectivity_error');
      
      // Should not have updated lastFortuneDate
      const state = fortuneManager.getFortuneState();
      expect(state.lastFortuneDate).toBeNull();
      expect(state.canGenerateNew).toBe(true);
    });

    it('should generate AI fortune when LLM succeeds', async () => {
      const fortune = await fortuneManager.generateFortune(mockProfile);
      
      expect(fortune.source).toBe('ai');
      expect(mockLlmService.generateFortune).toHaveBeenCalledWith(
        mockProfile,
        expect.any(Array)
      );
    });

  });

  describe('Simplified Connectivity Handling', () => {
    it('should provide connectivity error for any LLM unavailability', () => {
      const connectivityFortune = fortuneManager.getConnectivityErrorFortune(mockProfile);
      
      expect(connectivityFortune.source).toBe('connectivity_error');
      expect(connectivityFortune.message).toBe("Even fortune cookies need Wi-Fi. Come back when the stars (and your connection) align!");
      expect(connectivityFortune.decorativeElements.ideogram).toBe("📶");
      expect(connectivityFortune.decorativeElements.signature).toBe("Tech Support Oracle");
    });

    it('should identify connectivity errors correctly', () => {
      const aiFortune: Fortune = {
        id: 'ai_fortune',
        message: 'AI generated message',
        generatedAt: new Date(),
        expiresAt: calculateFortuneExpiration(new Date()),
        source: 'ai',
        decorativeElements: { ideogram: '龍', signature: 'AI' }
      };

      const connectivityFortune: Fortune = {
        id: 'connectivity_fortune',
        message: 'Even fortune cookies need Wi-Fi. Come back when the stars (and your connection) align!',
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        source: 'connectivity_error',
        decorativeElements: { ideogram: '📶', signature: 'Tech Support Oracle' }
      };

      expect(FortuneManager.isConnectivityError(aiFortune)).toBe(false);
      expect(FortuneManager.isConnectivityError(connectivityFortune)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when no profile provided', async () => {
      await expect(fortuneManager.generateFortune(null as any))
        .rejects.toThrow(FortuneManagerError);
    });

    it('should throw cooldown error when trying to generate too soon', async () => {
      await fortuneManager.generateFortune(mockProfile);
      
      await expect(fortuneManager.generateFortune(mockProfile))
        .rejects.toThrow(FortuneManagerError);
    });

    it('should handle storage errors gracefully', async () => {
      mockAppStorage.saveFortune.mockRejectedValue(new Error('Storage failed'));
      
      await expect(fortuneManager.generateFortune(mockProfile))
        .rejects.toThrow(FortuneManagerError);
    });
  });

  describe('Force Refresh', () => {
    it('should bypass cooldown when force refreshing', async () => {
      // Generate initial fortune
      await fortuneManager.generateFortune(mockProfile);
      
      // Should not be able to generate normally
      expect(fortuneManager.canGenerateNewFortune()).toBe(false);
      
      // But should be able to force refresh
      const newFortune = await fortuneManager.forceRefreshFortune(mockProfile);
      expect(newFortune).toBeDefined();
      expect(mockLlmService.generateFortune).toHaveBeenCalledTimes(2);
    });
  });

  describe('8am Daily Reset Logic', () => {
    it('should allow fortune generation at 8am after previous day generation', () => {
      // Mock yesterday at 3pm
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(15, 0, 0, 0);
      
      // Mock today at 8am
      const today8am = new Date();
      today8am.setHours(8, 0, 0, 0);
      
      expect(canGenerateFortuneToday(today8am, yesterday)).toBe(true);
    });

    it('should prevent fortune generation before 8am if generated after 8am same day', () => {
      // Mock today at 10am (after 8am)
      const today10am = new Date();
      today10am.setHours(10, 0, 0, 0);
      
      // Mock current time at 11am same day
      const today11am = new Date();
      today11am.setHours(11, 0, 0, 0);
      
      expect(canGenerateFortuneToday(today11am, today10am)).toBe(false);
    });

    it('should allow fortune generation if generated before 8am and now after 8am same day', () => {
      // Mock today at 7am (before 8am)
      const today7am = new Date();
      today7am.setHours(7, 0, 0, 0);
      
      // Mock current time at 9am same day (after 8am)
      const today9am = new Date();
      today9am.setHours(9, 0, 0, 0);
      
      expect(canGenerateFortuneToday(today9am, today7am)).toBe(true);
    });

    it('should calculate next 8am correctly when before 8am', () => {
      // Mock current time to be 6am today
      const mockNow = new Date();
      mockNow.setHours(6, 0, 0, 0);
      
      const next8am = getNext8amLocalTime(mockNow);
      
      // Should be 8am today
      expect(next8am.getHours()).toBe(8);
      expect(next8am.getDate()).toBe(mockNow.getDate());
    });

    it('should calculate next 8am correctly when after 8am', () => {
      // Mock current time to be 10am today
      const mockNow = new Date();
      mockNow.setHours(10, 0, 0, 0);
      
      const next8am = getNext8amLocalTime(mockNow);
      
      // Should be 8am tomorrow
      expect(next8am.getHours()).toBe(8);
      expect(next8am.getDate()).toBe(mockNow.getDate() + 1);
    });
  });

  describe('Fortune State', () => {
    it('should return correct fortune state', async () => {
      const fortune = await fortuneManager.generateFortune(mockProfile);
      
      const state = fortuneManager.getFortuneState();
      
      expect(state.currentFortune).toEqual(fortune);
      expect(state.lastFortuneDate).toBeInstanceOf(Date);
      expect(state.canGenerateNew).toBe(false);
      expect(state.timeUntilNext).toBeGreaterThan(0);
    });
  });
});