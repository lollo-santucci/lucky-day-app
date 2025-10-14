/**
 * Unit tests for ProfileManager service
 */

import { ProfileManager, ProfileCreationError } from '../profileManager';
import { BirthDetails, AstrologicalProfile } from '../../types/astrology';
import { AppStorage } from '../../utils/storage';

// Mock the dependencies
jest.mock('../astrology');
jest.mock('../../utils/storage');

// Mock the astrology functions
const mockCalculateChineseZodiac = jest.fn();
const mockCalculateFourPillars = jest.fn();
const mockGenerateMysticalNickname = jest.fn();
const mockGeneratePillarDescriptions = jest.fn();
const mockGenerateEssenceSummary = jest.fn();

// Mock the storage functions
const mockSaveProfile = jest.fn();
const mockLoadProfile = jest.fn();
const mockRemoveProfile = jest.fn();

// Set up mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock astrology module
  const astrologyModule = require('../astrology');
  astrologyModule.calculateChineseZodiac = mockCalculateChineseZodiac;
  astrologyModule.calculateFourPillars = mockCalculateFourPillars;
  astrologyModule.generateMysticalNickname = mockGenerateMysticalNickname;
  astrologyModule.generatePillarDescriptions = mockGeneratePillarDescriptions;
  astrologyModule.generateEssenceSummary = mockGenerateEssenceSummary;
  
  // Mock storage
  (AppStorage.saveProfile as jest.Mock) = mockSaveProfile;
  (AppStorage.loadProfile as jest.Mock) = mockLoadProfile;
  (AppStorage.removeProfile as jest.Mock) = mockRemoveProfile;
});

describe('ProfileManager', () => {
  const mockBirthDetails: BirthDetails = {
    date: new Date('1990-05-15'),
    time: '14:30',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    }
  };

  const mockZodiac = {
    animal: 'horse' as const,
    element: 'metal' as const,
    year: 1990
  };

  const mockPillars = {
    year: { stem: '庚', branch: '午', element: 'metal' },
    month: { stem: '辛', branch: '巳', element: 'metal' },
    day: { stem: '壬', branch: '辰', element: 'water' },
    hour: { stem: '丁', branch: '未', element: 'fire' }
  };

  const mockPillarDescriptions = {
    year: 'Your destiny shines with metallic brilliance.',
    month: 'Your environment flows with creative energy.',
    day: 'Your essence runs deep like hidden springs.',
    hour: 'Your inner heart blazes with inspiration.'
  };

  const mockProfile: AstrologicalProfile = {
    zodiac: mockZodiac,
    pillars: mockPillars,
    mysticalNickname: 'Swift Horse',
    pillarDescriptions: mockPillarDescriptions,
    essenceSummary: 'Born under the metal horse, you carry wisdom\nYour pillars dance between elements\nIn your heart flows eternal spirit'
  };

  describe('createProfile', () => {
    beforeEach(() => {
      mockCalculateChineseZodiac.mockReturnValue(mockZodiac);
      mockCalculateFourPillars.mockReturnValue(mockPillars);
      mockGenerateMysticalNickname.mockResolvedValue('Swift Horse');
      mockGeneratePillarDescriptions.mockResolvedValue(mockPillarDescriptions);
      mockGenerateEssenceSummary.mockResolvedValue('Born under the metal horse, you carry wisdom\nYour pillars dance between elements\nIn your heart flows eternal spirit');
    });

    it('should create a complete profile successfully', async () => {
      const result = await ProfileManager.createProfile(mockBirthDetails);

      expect(result).toEqual(mockProfile);
      expect(mockCalculateChineseZodiac).toHaveBeenCalledWith(mockBirthDetails.date);
      expect(mockCalculateFourPillars).toHaveBeenCalledWith(mockBirthDetails);
      expect(mockGenerateMysticalNickname).toHaveBeenCalledWith(mockZodiac);
      expect(mockGeneratePillarDescriptions).toHaveBeenCalledWith(mockPillars);
      expect(mockGenerateEssenceSummary).toHaveBeenCalledWith(mockZodiac, mockPillars);
    });

    it('should handle zodiac calculation errors', async () => {
      mockCalculateChineseZodiac.mockImplementation(() => {
        throw new Error('Zodiac calculation failed');
      });

      await expect(ProfileManager.createProfile(mockBirthDetails))
        .rejects.toThrow(ProfileCreationError);
      
      try {
        await ProfileManager.createProfile(mockBirthDetails);
      } catch (error) {
        expect(error).toBeInstanceOf(ProfileCreationError);
        expect((error as ProfileCreationError).step).toBe('zodiac_calculation');
      }
    });

    it('should handle Four Pillars calculation errors', async () => {
      mockCalculateFourPillars.mockImplementation(() => {
        throw new Error('Pillars calculation failed');
      });

      await expect(ProfileManager.createProfile(mockBirthDetails))
        .rejects.toThrow(ProfileCreationError);
      
      try {
        await ProfileManager.createProfile(mockBirthDetails);
      } catch (error) {
        expect(error).toBeInstanceOf(ProfileCreationError);
        expect((error as ProfileCreationError).step).toBe('pillars_calculation');
      }
    });

    it('should use fallback nickname when generation fails', async () => {
      mockGenerateMysticalNickname.mockRejectedValue(new Error('Nickname generation failed'));

      const result = await ProfileManager.createProfile(mockBirthDetails);

      expect(result.mysticalNickname).toBe('Mystical Horse');
    });

    it('should use fallback descriptions when generation fails', async () => {
      mockGeneratePillarDescriptions.mockRejectedValue(new Error('Description generation failed'));

      const result = await ProfileManager.createProfile(mockBirthDetails);

      expect(result.pillarDescriptions.year).toContain('destiny flows');
      expect(result.pillarDescriptions.month).toContain('environment nurtures');
      expect(result.pillarDescriptions.day).toContain('essence shines');
      expect(result.pillarDescriptions.hour).toContain('inner heart beats');
    });

    it('should use fallback essence summary when generation fails', async () => {
      mockGenerateEssenceSummary.mockRejectedValue(new Error('Essence generation failed'));

      const result = await ProfileManager.createProfile(mockBirthDetails);

      expect(result.essenceSummary).toContain('Born under the metal horse');
      expect(result.essenceSummary.split('\n')).toHaveLength(3);
    });
  });

  describe('saveProfile', () => {
    it('should save profile successfully', async () => {
      mockSaveProfile.mockResolvedValue(undefined);

      await ProfileManager.saveProfile(mockProfile);

      expect(mockSaveProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle storage errors', async () => {
      mockSaveProfile.mockRejectedValue(new Error('Storage failed'));

      await expect(ProfileManager.saveProfile(mockProfile))
        .rejects.toThrow(ProfileCreationError);
      
      try {
        await ProfileManager.saveProfile(mockProfile);
      } catch (error) {
        expect(error).toBeInstanceOf(ProfileCreationError);
        expect((error as ProfileCreationError).step).toBe('storage_save');
      }
    });
  });

  describe('loadProfile', () => {
    it('should load profile successfully', async () => {
      mockLoadProfile.mockResolvedValue(mockProfile);

      const result = await ProfileManager.loadProfile();

      expect(result).toEqual(mockProfile);
      expect(mockLoadProfile).toHaveBeenCalled();
    });

    it('should return null when no profile exists', async () => {
      mockLoadProfile.mockResolvedValue(null);

      const result = await ProfileManager.loadProfile();

      expect(result).toBeNull();
    });

    it('should return null when loading fails', async () => {
      mockLoadProfile.mockRejectedValue(new Error('Load failed'));

      const result = await ProfileManager.loadProfile();

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockLoadProfile.mockResolvedValue(mockProfile);
      mockSaveProfile.mockResolvedValue(undefined);

      const updates = { mysticalNickname: 'Updated Horse' };
      const result = await ProfileManager.updateProfile(updates);

      expect(result.mysticalNickname).toBe('Updated Horse');
      expect(mockSaveProfile).toHaveBeenCalledWith({
        ...mockProfile,
        ...updates
      });
    });

    it('should throw error when no existing profile found', async () => {
      mockLoadProfile.mockResolvedValue(null);

      await expect(ProfileManager.updateProfile({ mysticalNickname: 'New Name' }))
        .rejects.toThrow(ProfileCreationError);
    });
  });

  describe('validateProfile', () => {
    it('should validate complete profile as valid', () => {
      const result = ProfileManager.validateProfile(mockProfile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing zodiac information', () => {
      const invalidProfile = {
        ...mockProfile,
        zodiac: { ...mockProfile.zodiac, animal: '' as any }
      };

      const result = ProfileManager.validateProfile(invalidProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid zodiac information');
    });

    it('should detect missing pillar information', () => {
      const invalidProfile = {
        ...mockProfile,
        pillars: { ...mockProfile.pillars, year: null as any }
      };

      const result = ProfileManager.validateProfile(invalidProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid Four Pillars information');
    });

    it('should detect missing mystical nickname', () => {
      const invalidProfile = {
        ...mockProfile,
        mysticalNickname: ''
      };

      const result = ProfileManager.validateProfile(invalidProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing mystical nickname');
    });
  });

  describe('createAndSaveProfile', () => {
    beforeEach(() => {
      mockCalculateChineseZodiac.mockReturnValue(mockZodiac);
      mockCalculateFourPillars.mockReturnValue(mockPillars);
      mockGenerateMysticalNickname.mockResolvedValue('Swift Horse');
      mockGeneratePillarDescriptions.mockResolvedValue(mockPillarDescriptions);
      mockGenerateEssenceSummary.mockResolvedValue('Born under the metal horse, you carry wisdom\nYour pillars dance between elements\nIn your heart flows eternal spirit');
      mockSaveProfile.mockResolvedValue(undefined);
    });

    it('should create and save profile successfully', async () => {
      const result = await ProfileManager.createAndSaveProfile(mockBirthDetails);

      expect(result).toEqual(mockProfile);
      expect(mockSaveProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should handle profile creation errors', async () => {
      mockCalculateChineseZodiac.mockImplementation(() => {
        throw new Error('Zodiac failed');
      });

      await expect(ProfileManager.createAndSaveProfile(mockBirthDetails))
        .rejects.toThrow(ProfileCreationError);
    });

    it('should handle storage errors', async () => {
      mockSaveProfile.mockRejectedValue(new Error('Storage failed'));

      await expect(ProfileManager.createAndSaveProfile(mockBirthDetails))
        .rejects.toThrow(ProfileCreationError);
    });
  });

  describe('exportProfile', () => {
    it('should export profile as JSON string', () => {
      const result = ProfileManager.exportProfile(mockProfile);

      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual(mockProfile);
    });
  });

  describe('importProfile', () => {
    it('should import valid profile data', () => {
      const profileJson = JSON.stringify(mockProfile);
      const result = ProfileManager.importProfile(profileJson);

      expect(result).toEqual(mockProfile);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => ProfileManager.importProfile('invalid json'))
        .toThrow(ProfileCreationError);
    });

    it('should throw error for invalid profile data', () => {
      const invalidProfile = { ...mockProfile, zodiac: null };
      const profileJson = JSON.stringify(invalidProfile);

      expect(() => ProfileManager.importProfile(profileJson))
        .toThrow(ProfileCreationError);
    });
  });
});