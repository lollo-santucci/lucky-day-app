/**
 * Daily Reset Integration Test
 * Tests the specific scenario where users receive notifications at 8am
 * but still see the previous day's fortune
 */

import { FortuneManager } from '../fortuneManager';
import { AppStorage } from '../../utils/storage';
import { llmService } from '../llm';
import { AstrologicalProfile } from '../../types/astrology';
import { Fortune } from '../../types/fortune';

// Mock dependencies
jest.mock('../../utils/storage');

// Mock the LLM service
jest.mock('../llm', () => ({
  llmService: {
    generateFortune: jest.fn()
  }
}));

const mockStorage = AppStorage as jest.Mocked<typeof AppStorage>;
const mockLlmService = llmService as jest.Mocked<typeof llmService>;

describe('Daily Reset Integration Test', () => {
  let fortuneManager: FortuneManager;
  let mockProfile: AstrologicalProfile;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh instance for each test
    fortuneManager = FortuneManager.getInstance();
    
    // Mock profile
    mockProfile = {
      mysticalNickname: 'Cosmic Wanderer',
      zodiac: {
        animal: 'dragon',
        element: 'fire',
        year: 1990
      },
      pillars: {
        year: { stem: 'Geng', branch: 'Wu', element: 'Metal' },
        month: { stem: 'Wu', branch: 'Zi', element: 'Earth' },
        day: { stem: 'Ren', branch: 'Shen', element: 'Water' },
        hour: { stem: 'Ren', branch: 'Wu', element: 'Water' }
      },
      pillarDescriptions: {
        year: 'Metal Horse - Strong and determined',
        month: 'Earth Rat - Practical and resourceful',
        day: 'Water Monkey - Clever and adaptable',
        hour: 'Water Horse - Intuitive and free-spirited'
      },
      essenceSummary: 'A dynamic soul with the strength of metal, wisdom of water, and freedom of the horse.'
    };

    // Setup default mocks
    mockStorage.loadFortune.mockResolvedValue(null);
    mockStorage.loadAppState.mockResolvedValue(null);
    mockStorage.saveFortune.mockResolvedValue();
    mockStorage.saveAppState.mockResolvedValue();
    mockStorage.removeFortune.mockResolvedValue();
    
    mockLlmService.generateFortune.mockResolvedValue('Test fortune message');
  });

  describe('8am Daily Reset Scenario', () => {
    it('should clear old fortune when new one can be generated at 8am', async () => {
      // Simulate yesterday's fortune (generated at 10am yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);

      const yesterdayFortune: Fortune = {
        id: 'yesterday_fortune',
        message: 'Yesterday fortune message',
        generatedAt: yesterday,
        expiresAt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000), // Expires today at 8am
        source: 'ai',
        decorativeElements: {
          ideogram: '福',
          signature: '運命'
        }
      };

      // Mock storage to return yesterday's fortune
      mockStorage.loadFortune.mockResolvedValue(yesterdayFortune);
      mockStorage.loadAppState.mockResolvedValue({
        profile: mockProfile,
        currentFortune: yesterdayFortune,
        lastFortuneDate: yesterday,
        settings: {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: 1,
          appOpens: 1,
          lastActiveDate: yesterday
        }
      });

      // Initialize fortune manager
      await fortuneManager.initialize();

      // Simulate current time being 8:01am today (after daily reset)
      const now = new Date();
      now.setHours(8, 1, 0, 0);
      
      // Mock Date.now to return our test time
      const originalNow = Date.now;
      Date.now = jest.fn(() => now.getTime());

      try {
        // Get fortune state - this should clear the old fortune since new one can be generated
        const state = fortuneManager.getFortuneState();

        // Verify that:
        // 1. A new fortune can be generated
        expect(state.canGenerateNew).toBe(true);
        
        // 2. The old fortune is cleared from the state
        expect(state.currentFortune).toBeNull();
        
        // 3. Time until next is 0 (can generate now)
        expect(state.timeUntilNext).toBe(0);

        // 4. The old fortune should be removed from storage
        expect(mockStorage.removeFortune).toHaveBeenCalled();

      } finally {
        // Restore original Date.now
        Date.now = originalNow;
      }
    });

    it('should preserve connectivity error fortunes even when new fortune can be generated', async () => {
      // Simulate a connectivity error fortune from earlier
      const connectivityFortune: Fortune = {
        id: 'connectivity_fortune',
        message: "Even fortune cookies need Wi-Fi. Come back when the stars (and your connection) align!",
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
        source: 'connectivity_error',
        decorativeElements: {
          ideogram: '📶',
          signature: 'Tech Support Oracle'
        }
      };

      // Mock storage to return connectivity error fortune
      mockStorage.loadFortune.mockResolvedValue(connectivityFortune);
      mockStorage.loadAppState.mockResolvedValue({
        profile: mockProfile,
        currentFortune: connectivityFortune,
        lastFortuneDate: null, // No real fortune generated yet
        settings: {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: 0,
          appOpens: 1,
          lastActiveDate: new Date()
        }
      });

      // Initialize fortune manager
      await fortuneManager.initialize();

      // Get fortune state
      const state = fortuneManager.getFortuneState();

      // Verify that:
      // 1. A new fortune can be generated (connectivity errors don't consume quota)
      expect(state.canGenerateNew).toBe(true);
      
      // 2. The connectivity error fortune is preserved (not cleared)
      expect(state.currentFortune).toEqual(connectivityFortune);
      
      // 3. Time until next is 0 (can generate now)
      expect(state.timeUntilNext).toBe(0);

      // 4. Storage should NOT be cleared for connectivity errors
      expect(mockStorage.removeFortune).not.toHaveBeenCalled();
    });

    it('should handle the complete user flow from notification to new fortune', async () => {
      // Step 1: User had a fortune yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(15, 30, 0, 0); // Generated at 3:30pm yesterday

      const yesterdayFortune: Fortune = {
        id: 'yesterday_fortune',
        message: 'Yesterday fortune message',
        generatedAt: yesterday,
        expiresAt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        source: 'ai',
        decorativeElements: {
          ideogram: '福',
          signature: '運命'
        }
      };

      mockStorage.loadFortune.mockResolvedValue(yesterdayFortune);
      mockStorage.loadAppState.mockResolvedValue({
        profile: mockProfile,
        currentFortune: yesterdayFortune,
        lastFortuneDate: yesterday,
        settings: {
          notificationsEnabled: true,
          soundEnabled: true,
          iCloudSyncEnabled: false
        },
        analytics: {
          fortunesGenerated: 1,
          appOpens: 5,
          lastActiveDate: yesterday
        }
      });

      await fortuneManager.initialize();

      // Step 2: User opens app at 8:05am (after notification)
      const now = new Date();
      now.setHours(8, 5, 0, 0);
      
      const originalNow = Date.now;
      Date.now = jest.fn(() => now.getTime());

      try {
        // Step 3: Check initial state - old fortune should be cleared
        const initialState = fortuneManager.getFortuneState();
        expect(initialState.canGenerateNew).toBe(true);
        expect(initialState.currentFortune).toBeNull(); // Old fortune cleared
        
        // Step 4: User breaks the cookie to generate new fortune
        const newFortune = await fortuneManager.generateFortune(mockProfile);
        
        // Step 5: Verify new fortune is generated and cached
        expect(newFortune).toBeDefined();
        expect(newFortune.source).toBe('ai');
        expect(newFortune.message).toBe('Test fortune message');
        
        // Step 6: Verify state after generation
        const finalState = fortuneManager.getFortuneState();
        expect(finalState.canGenerateNew).toBe(false); // Can't generate another until tomorrow
        expect(finalState.currentFortune).toEqual(newFortune);
        expect(finalState.timeUntilNext).toBeGreaterThan(0); // Time until next 8am

      } finally {
        Date.now = originalNow;
      }
    });
  });
});