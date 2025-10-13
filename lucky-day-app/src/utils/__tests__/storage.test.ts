/**
 * Unit tests for storage operations and error handling
 * Tests StorageManager and AppStorage classes with various scenarios
 */

// Mock expo-crypto first
const mockDigestStringAsync = jest.fn();
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
  digestStringAsync: mockDigestStringAsync,
}));

import { StorageManager, AppStorage, StorageError, STORAGE_KEYS } from '../storage';
import { AstrologicalProfile } from '../../types/astrology';
import { Fortune } from '../../types/fortune';
import { AppState } from '../../types/app';

// Helper function to compare objects with Date handling
function expectObjectWithDates(received: any, expected: any) {
  // Check that all non-Date properties match
  const receivedCopy = JSON.parse(JSON.stringify(received));
  const expectedCopy = JSON.parse(JSON.stringify(expected));
  
  // For Date properties, check that they are Date instances and have correct values
  function checkDates(obj1: any, obj2: any, path = '') {
    for (const key in obj2) {
      const currentPath = path ? `${path}.${key}` : key;
      if (obj2[key] instanceof Date) {
        expect(obj1[key]).toBeInstanceOf(Date);
        expect(obj1[key].getTime()).toBe(obj2[key].getTime());
      } else if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
        checkDates(obj1[key], obj2[key], currentPath);
      } else if (Array.isArray(obj2[key])) {
        obj2[key].forEach((item: any, index: number) => {
          if (item instanceof Date) {
            expect(obj1[key][index]).toBeInstanceOf(Date);
            expect(obj1[key][index].getTime()).toBe(item.getTime());
          } else if (typeof item === 'object' && item !== null) {
            checkDates(obj1[key][index], item, `${currentPath}[${index}]`);
          }
        });
      }
    }
  }
  
  checkDates(received, expected);
}

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    (global as any).mockAsyncStorage.getItem.mockResolvedValue(null);
    (global as any).mockAsyncStorage.setItem.mockResolvedValue(undefined);
    (global as any).mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    (global as any).mockAsyncStorage.multiRemove.mockResolvedValue(undefined);
    (global as any).mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    
    // Mock crypto function
    mockDigestStringAsync.mockResolvedValue('mocked_hash_value_1234567890abcdef');
  });

  describe('setItem', () => {
    it('should store data without encryption', async () => {
      const testData = { test: 'value', date: new Date('2024-01-15') };
      
      await StorageManager.setItem('test_key', testData, false);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        JSON.stringify(testData, expect.any(Function))
      );
    });

    it('should store data with encryption', async () => {
      const testData = { sensitive: 'data' };
      
      await StorageManager.setItem('test_key', testData, true);
      
      expect(mockDigestStringAsync).toHaveBeenCalled();
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'test_key',
        expect.stringContaining('mocked_hash_valu:')
      );
    });

    it('should handle Date serialization', async () => {
      const testData = { date: new Date('2024-01-15T10:30:00Z') };
      
      await StorageManager.setItem('test_key', testData, false);
      
      // Check that setItem was called with serialized data
      const setItemCall = (global as any).mockAsyncStorage.setItem.mock.calls[0];
      const serializedData = setItemCall[1];
      
      // The serialized data should contain the date in some format
      expect(serializedData).toContain('2024-01-15T10:30:00.000Z');
      expect(typeof serializedData).toBe('string');
    });

    it('should throw StorageError on AsyncStorage failure', async () => {
      (global as any).mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));
      
      await expect(StorageManager.setItem('test_key', { test: 'data' }))
        .rejects.toThrow(StorageError);
    });

    it('should throw StorageError on encryption failure', async () => {
      mockDigestStringAsync.mockRejectedValue(new Error('Crypto error'));
      
      await expect(StorageManager.setItem('test_key', { test: 'data' }, true))
        .rejects.toThrow(StorageError);
    });
  });

  describe('getItem', () => {
    it('should retrieve and deserialize data without encryption', async () => {
      const testData = { test: 'value', date: { __type: 'Date', value: '2024-01-15T10:30:00.000Z' } };
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(testData));
      
      const result = await StorageManager.getItem('test_key', false);
      
      expect(result).toEqual({
        test: 'value',
        date: new Date('2024-01-15T10:30:00.000Z')
      });
    });

    it('should return null when item does not exist', async () => {
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await StorageManager.getItem('test_key', false);
      
      expect(result).toBeNull();
    });

    it('should retrieve and decrypt data with encryption', async () => {
      const originalData = { sensitive: 'data' };
      const encodedData = Buffer.from(JSON.stringify(originalData)).toString('base64');
      const encryptedData = `mocked_hash_value_12:${encodedData}`;
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(encryptedData);
      
      const result = await StorageManager.getItem('test_key', true);
      
      expect(mockDigestStringAsync).toHaveBeenCalled();
      expect(result).toEqual(originalData);
    });

    it('should throw StorageError on decryption failure', async () => {
      (global as any).mockAsyncStorage.getItem.mockResolvedValue('invalid:encrypted:data');
      
      await expect(StorageManager.getItem('test_key', true))
        .rejects.toThrow(StorageError);
    });

    it('should throw StorageError on deserialization failure', async () => {
      (global as any).mockAsyncStorage.getItem.mockResolvedValue('invalid json');
      
      await expect(StorageManager.getItem('test_key', false))
        .rejects.toThrow(StorageError);
    });

    it('should throw StorageError on AsyncStorage failure', async () => {
      (global as any).mockAsyncStorage.getItem.mockRejectedValue(new Error('Network error'));
      
      await expect(StorageManager.getItem('test_key', false))
        .rejects.toThrow(StorageError);
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', async () => {
      await StorageManager.removeItem('test_key');
      
      expect((global as any).mockAsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('should throw StorageError on removal failure', async () => {
      (global as any).mockAsyncStorage.removeItem.mockRejectedValue(new Error('Permission denied'));
      
      await expect(StorageManager.removeItem('test_key'))
        .rejects.toThrow(StorageError);
    });
  });

  describe('clearAll', () => {
    it('should clear all app storage keys', async () => {
      await StorageManager.clearAll();
      
      expect((global as any).mockAsyncStorage.multiRemove).toHaveBeenCalledWith(
        Object.values(STORAGE_KEYS)
      );
    });

    it('should throw StorageError on clear failure', async () => {
      (global as any).mockAsyncStorage.multiRemove.mockRejectedValue(new Error('Clear failed'));
      
      await expect(StorageManager.clearAll())
        .rejects.toThrow(StorageError);
    });
  });

  describe('getAllKeys', () => {
    it('should return only app-related keys', async () => {
      const allKeys = [
        '@lucky_day_app_state',
        '@lucky_day_profile',
        '@other_app_key',
        '@lucky_day_settings'
      ];
      (global as any).mockAsyncStorage.getAllKeys.mockResolvedValue(allKeys);
      
      const result = await StorageManager.getAllKeys();
      
      expect(result).toEqual([
        '@lucky_day_app_state',
        '@lucky_day_profile',
        '@lucky_day_settings'
      ]);
    });

    it('should throw StorageError on getAllKeys failure', async () => {
      (global as any).mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('Access denied'));
      
      await expect(StorageManager.getAllKeys())
        .rejects.toThrow(StorageError);
    });
  });
});

describe('AppStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).mockAsyncStorage.getItem.mockResolvedValue(null);
    (global as any).mockAsyncStorage.setItem.mockResolvedValue(undefined);
    (global as any).mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockDigestStringAsync.mockResolvedValue('mocked_hash_value_1234567890abcdef');
  });

  describe('App State operations', () => {
    const mockAppState: AppState = {
      profile: null,
      currentFortune: null,
      lastFortuneDate: null,
      settings: {
        notificationsEnabled: true,
        soundEnabled: true,
        iCloudSyncEnabled: false,
      },
      analytics: {
        fortunesGenerated: 5,
        appOpens: 20,
        lastActiveDate: new Date('2024-01-15'),
      },
    };

    it('should save and load app state', async () => {
      await AppStorage.saveAppState(mockAppState);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.APP_STATE,
        expect.any(String)
      );

      // Mock the retrieval with proper Date serialization
      const serializedAppState = JSON.stringify(mockAppState, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(serializedAppState);

      const loaded = await AppStorage.loadAppState();
      expect(loaded).toBeTruthy();
      expect(loaded!.settings.notificationsEnabled).toBe(true);
      expect(loaded!.analytics.fortunesGenerated).toBe(5);
      expect(loaded!.analytics.appOpens).toBe(20);
    });

    it('should return null when no app state exists', async () => {
      const result = await AppStorage.loadAppState();
      expect(result).toBeNull();
    });
  });

  describe('Profile operations', () => {
    const mockProfile: AstrologicalProfile = {
      zodiac: { animal: 'dragon', element: 'earth', year: 1990 },
      pillars: {
        year: { stem: '庚', branch: '午', element: 'metal' },
        month: { stem: '戊', branch: '寅', element: 'earth' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' },
      },
      mysticalNickname: 'Earthbound Dragon',
      pillarDescriptions: {
        year: 'A destiny of strength and leadership',
        month: 'An environment of growth and stability',
        day: 'An essence of creativity and new beginnings',
        hour: 'An inner heart of passion and energy',
      },
      essenceSummary: 'The Earthbound Dragon walks between worlds,\nBalancing power with wisdom,\nCreating harmony from chaos.',
    };

    it('should save and load profile with encryption', async () => {
      await AppStorage.saveProfile(mockProfile);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PROFILE,
        expect.stringContaining('mocked_hash_valu:')
      );

      // Mock encrypted retrieval
      const serializedProfile = JSON.stringify(mockProfile, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      const encodedData = Buffer.from(serializedProfile).toString('base64');
      const encryptedData = `mocked_hash_valu:${encodedData}`;
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(encryptedData);

      const loaded = await AppStorage.loadProfile();
      expect(loaded).toEqual(mockProfile);
    });

    it('should remove profile', async () => {
      await AppStorage.removeProfile();
      
      expect((global as any).mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PROFILE
      );
    });
  });

  describe('Fortune operations', () => {
    const mockFortune: Fortune = {
      id: 'fortune-123',
      message: 'Today brings new opportunities for growth and wisdom.',
      generatedAt: new Date('2024-01-15T10:00:00Z'),
      expiresAt: new Date('2024-01-16T08:00:00Z'),
      source: 'ai',
      decorativeElements: {
        ideogram: '福',
        signature: 'Master Chen',
      },
    };

    it('should save and load fortune', async () => {
      await AppStorage.saveFortune(mockFortune);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_FORTUNE,
        expect.any(String)
      );

      // Mock the retrieval with Date handling
      const serializedFortune = JSON.stringify(mockFortune, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(serializedFortune);

      const loaded = await AppStorage.loadFortune();
      expect(loaded).toBeTruthy();
      expect(loaded!.id).toBe('fortune-123');
      expect(loaded!.message).toBe('Today brings new opportunities for growth and wisdom.');
      expect(loaded!.source).toBe('ai');
    });

    it('should remove fortune', async () => {
      await AppStorage.removeFortune();
      
      expect((global as any).mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CURRENT_FORTUNE
      );
    });
  });

  describe('Settings operations', () => {
    const mockSettings = {
      notificationsEnabled: true,
      soundEnabled: false,
      iCloudSyncEnabled: true,
    };

    it('should save and load settings with encryption', async () => {
      await AppStorage.saveSettings(mockSettings);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SETTINGS,
        expect.stringContaining('mocked_hash_valu:')
      );

      // Mock encrypted retrieval
      const encodedData = Buffer.from(JSON.stringify(mockSettings)).toString('base64');
      const encryptedData = `mocked_hash_valu:${encodedData}`;
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(encryptedData);

      const loaded = await AppStorage.loadSettings();
      expect(loaded).toEqual(mockSettings);
    });
  });

  describe('Analytics operations', () => {
    const mockAnalytics = {
      fortunesGenerated: 10,
      appOpens: 50,
      lastActiveDate: new Date('2024-01-15'),
    };

    it('should save and load analytics', async () => {
      await AppStorage.saveAnalytics(mockAnalytics);
      
      expect((global as any).mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ANALYTICS,
        expect.any(String)
      );

      // Mock the retrieval with Date handling
      const serializedAnalytics = JSON.stringify(mockAnalytics, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      
      (global as any).mockAsyncStorage.getItem.mockResolvedValue(serializedAnalytics);

      const loaded = await AppStorage.loadAnalytics();
      expect(loaded).toBeTruthy();
      expect(loaded!.fortunesGenerated).toBe(10);
      expect(loaded!.appOpens).toBe(50);
    });
  });

  describe('Clear operations', () => {
    it('should clear all app data', async () => {
      await AppStorage.clearAllData();
      
      expect((global as any).mockAsyncStorage.multiRemove).toHaveBeenCalledWith(
        Object.values(STORAGE_KEYS)
      );
    });
  });
});

describe('StorageError', () => {
  it('should create error with operation and key', () => {
    const error = new StorageError('Test error', 'setItem', 'test_key');
    
    expect(error.message).toBe('Test error');
    expect(error.operation).toBe('setItem');
    expect(error.key).toBe('test_key');
    expect(error.name).toBe('StorageError');
  });

  it('should create error without key', () => {
    const error = new StorageError('Test error', 'clearAll');
    
    expect(error.message).toBe('Test error');
    expect(error.operation).toBe('clearAll');
    expect(error.key).toBeUndefined();
  });
});

describe('Data integrity across app sessions', () => {
  it('should maintain data integrity for complex nested objects', async () => {
    const complexData = {
      profile: {
        zodiac: { animal: 'dragon', element: 'earth', year: 1990 },
        pillars: {
          year: { stem: '庚', branch: '午', element: 'metal' },
          month: { stem: '戊', branch: '寅', element: 'earth' },
          day: { stem: '甲', branch: '子', element: 'wood' },
          hour: { stem: '丙', branch: '午', element: 'fire' },
        },
      },
      fortune: {
        id: 'test-fortune',
        message: 'Test message',
        generatedAt: new Date('2024-01-15T10:00:00Z'),
        expiresAt: new Date('2024-01-16T08:00:00Z'),
        source: 'ai' as const,
        decorativeElements: { ideogram: '福', signature: 'Test' },
      },
      dates: [
        new Date('2024-01-01'),
        new Date('2024-12-31T23:59:59.999Z'),
      ],
    };

    // Save the data
    await StorageManager.setItem('complex_data', complexData, false);

    // Simulate retrieval in a new session by getting the serialized data
    const savedCall = (global as any).mockAsyncStorage.setItem.mock.calls[0];
    const serializedData = savedCall[1];
    
    // Clear previous mocks and set up for retrieval
    jest.clearAllMocks();
    (global as any).mockAsyncStorage.getItem.mockResolvedValue(serializedData);
    
    const retrieved = await StorageManager.getItem('complex_data', false) as any;

    expect(retrieved).toBeTruthy();
    expect(retrieved.profile.zodiac.animal).toBe('dragon');
    expect(retrieved.fortune.id).toBe('test-fortune');
    expect(retrieved.dates).toHaveLength(2);
  });

  it('should handle encryption/decryption across sessions', async () => {
    const sensitiveData = {
      personalInfo: 'sensitive',
      birthDate: new Date('1990-01-15'),
      location: { lat: 40.7128, lng: -74.0060 },
    };

    // Save with encryption
    await StorageManager.setItem('sensitive_data', sensitiveData, true);

    // Get the encrypted data that would be stored
    const savedCall = (global as any).mockAsyncStorage.setItem.mock.calls[0];
    const encryptedData = savedCall[1];

    // Clear previous mocks and set up for retrieval
    jest.clearAllMocks();
    (global as any).mockAsyncStorage.getItem.mockResolvedValue(encryptedData);
    
    const retrieved = await StorageManager.getItem('sensitive_data', true) as any;

    expect(retrieved).toBeTruthy();
    expect(retrieved.personalInfo).toBe('sensitive');
    expect(retrieved.location.lat).toBe(40.7128);
  });

  it('should detect data corruption', async () => {
    // Simulate corrupted encrypted data
    (global as any).mockAsyncStorage.getItem.mockResolvedValue('corrupted:data:format');
    
    await expect(StorageManager.getItem('test_key', true))
      .rejects.toThrow(StorageError);
  });

  it('should handle storage quota exceeded', async () => {
    const error = new Error('QuotaExceededError');
    (global as any).mockAsyncStorage.setItem.mockRejectedValue(error);
    
    await expect(StorageManager.setItem('test_key', { large: 'data' }))
      .rejects.toThrow(StorageError);
  });
});