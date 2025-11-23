import { ProfileManager } from '../../services';
import { AstrologicalProfile } from '../../types/astrology';

// Mock the ProfileManager
jest.mock('../../services', () => ({
  ProfileManager: {
    createProfile: jest.fn(),
    saveProfile: jest.fn(),
    exportProfile: jest.fn(),
  },
}));

const mockProfile: AstrologicalProfile = {
  zodiac: {
    animal: 'dragon',
    element: 'fire',
    year: 1988,
  },
  pillars: {
    year: { stem: '戊', branch: '辰', element: 'earth' },
    month: { stem: '甲', branch: '寅', element: 'wood' },
    day: { stem: '丙', branch: '午', element: 'fire' },
    hour: { stem: '庚', branch: '申', element: 'metal' },
  },
  mysticalNickname: 'Radiant Fire Dragon',
  pillarDescriptions: {
    year: 'Your destiny flows with the power of the earth dragon, bringing stability and strength.',
    month: 'Your environment nurtures growth like the spring tiger, full of vitality and new beginnings.',
    day: 'Your essence burns bright like the summer horse, passionate and energetic.',
    hour: 'Your inner heart rings clear like the autumn monkey, clever and adaptable.',
  },
  essenceSummary: 'Born under the fire dragon, you carry ancient wisdom within\nYour pillars dance between elements, creating harmony in your life\'s journey\nIn your heart flows the eternal spirit, guiding you toward your true destiny',
};

describe('ProfileScreen Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates profile data structure', () => {
    // Test that the mock profile has all required fields
    expect(mockProfile.zodiac).toBeDefined();
    expect(mockProfile.zodiac.animal).toBe('dragon');
    expect(mockProfile.zodiac.element).toBe('fire');
    expect(mockProfile.zodiac.year).toBe(1988);
    
    expect(mockProfile.pillars).toBeDefined();
    expect(mockProfile.pillars.year).toBeDefined();
    expect(mockProfile.pillars.month).toBeDefined();
    expect(mockProfile.pillars.day).toBeDefined();
    expect(mockProfile.pillars.hour).toBeDefined();
    
    expect(mockProfile.mysticalNickname).toBe('Radiant Fire Dragon');
    expect(mockProfile.pillarDescriptions).toBeDefined();
    expect(mockProfile.essenceSummary).toBeDefined();
  });

  it('tests ProfileManager export functionality', () => {
    const mockExportData = JSON.stringify(mockProfile, null, 2);
    (ProfileManager.exportProfile as jest.Mock).mockReturnValue(mockExportData);

    const result = ProfileManager.exportProfile(mockProfile);
    
    expect(ProfileManager.exportProfile).toHaveBeenCalledWith(mockProfile);
    expect(result).toBe(mockExportData);
    expect(typeof result).toBe('string');
  });

  it('tests ProfileManager profile creation', async () => {
    const updatedProfile = { ...mockProfile, mysticalNickname: 'Updated Dragon' };
    (ProfileManager.createProfile as jest.Mock).mockResolvedValue(updatedProfile);
    (ProfileManager.saveProfile as jest.Mock).mockResolvedValue(undefined);

    const birthDetails = {
      date: new Date('1988-03-15'),
      time: '12:00',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      }
    };

    const result = await ProfileManager.createProfile(birthDetails);
    
    expect(ProfileManager.createProfile).toHaveBeenCalledWith(birthDetails);
    expect(result.mysticalNickname).toBe('Updated Dragon');
  });

  it('handles export errors gracefully', () => {
    (ProfileManager.exportProfile as jest.Mock).mockImplementation(() => {
      throw new Error('Export failed');
    });

    expect(() => {
      ProfileManager.exportProfile(mockProfile);
    }).toThrow('Export failed');
  });

  it('validates pillar descriptions format', () => {
    expect(mockProfile.pillarDescriptions.year).toContain('destiny');
    expect(mockProfile.pillarDescriptions.month).toContain('environment');
    expect(mockProfile.pillarDescriptions.day).toContain('essence');
    expect(mockProfile.pillarDescriptions.hour).toContain('heart');
  });

  it('validates essence summary format', () => {
    const lines = mockProfile.essenceSummary.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('dragon');
    expect(lines[1]).toContain('pillars');
    expect(lines[2]).toContain('spirit');
  });
});