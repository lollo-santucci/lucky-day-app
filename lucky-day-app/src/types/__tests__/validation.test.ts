/**
 * Unit tests for validation functions
 * Tests data validation functions for all data models
 */

import {
  validateBirthDetails,
  validateChineseZodiac,
  validateFourPillars,
  validateFortune,
  validateAppState,
  isBirthDetails,
  isChineseZodiac,
  isFourPillars,
  isFortune,
  isAppState,
} from '../validation';
import { BirthDetails, ChineseZodiac, FourPillars } from '../astrology';
import { Fortune } from '../fortune';
import { AppState } from '../app';

describe('validateBirthDetails', () => {
  const validBirthDetails: BirthDetails = {
    date: new Date('1990-01-15'),
    time: '14:30',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
    },
  };

  it('should validate correct birth details', () => {
    const result = validateBirthDetails(validBirthDetails);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should allow null time', () => {
    const birthDetails = { ...validBirthDetails, time: null };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid date', () => {
    const birthDetails = { ...validBirthDetails, date: new Date('invalid') };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Valid birth date is required');
  });

  it('should reject invalid time format', () => {
    const birthDetails = { ...validBirthDetails, time: '25:00' };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Birth time must be in HH:MM format or null');
  });

  it('should reject invalid latitude', () => {
    const birthDetails = {
      ...validBirthDetails,
      location: { ...validBirthDetails.location, latitude: 91 },
    };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Valid latitude (-90 to 90) is required');
  });

  it('should reject invalid longitude', () => {
    const birthDetails = {
      ...validBirthDetails,
      location: { ...validBirthDetails.location, longitude: 181 },
    };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Valid longitude (-180 to 180) is required');
  });

  it('should reject empty timezone', () => {
    const birthDetails = {
      ...validBirthDetails,
      location: { ...validBirthDetails.location, timezone: '' },
    };
    const result = validateBirthDetails(birthDetails);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Valid timezone string is required');
  });

  it('should reject non-object input', () => {
    const result = validateBirthDetails('invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Birth details must be an object');
  });
});

describe('validateChineseZodiac', () => {
  const validZodiac: ChineseZodiac = {
    animal: 'dragon',
    element: 'earth',
    year: 1990,
  };

  it('should validate correct zodiac data', () => {
    const result = validateChineseZodiac(validZodiac);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid animal', () => {
    const zodiac = { ...validZodiac, animal: 'lion' as any };
    const result = validateChineseZodiac(zodiac);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Animal must be one of:');
  });

  it('should reject invalid element', () => {
    const zodiac = { ...validZodiac, element: 'air' as any };
    const result = validateChineseZodiac(zodiac);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Element must be one of:');
  });

  it('should reject invalid year range', () => {
    const zodiac = { ...validZodiac, year: 1800 };
    const result = validateChineseZodiac(zodiac);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Year must be a number between 1900 and 2100');
  });

  it('should reject non-object input', () => {
    const result = validateChineseZodiac(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Chinese zodiac must be an object');
  });
});

describe('validateFourPillars', () => {
  const validPillars: FourPillars = {
    year: { stem: '庚', branch: '午', element: 'metal' },
    month: { stem: '戊', branch: '寅', element: 'earth' },
    day: { stem: '甲', branch: '子', element: 'wood' },
    hour: { stem: '丙', branch: '午', element: 'fire' },
  };

  it('should validate correct four pillars data', () => {
    const result = validateFourPillars(validPillars);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing pillar', () => {
    const pillars = { ...validPillars };
    delete (pillars as any).year;
    const result = validateFourPillars(pillars);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('year pillar is required and must be an object');
  });

  it('should reject empty stem', () => {
    const pillars = {
      ...validPillars,
      year: { ...validPillars.year, stem: '' },
    };
    const result = validateFourPillars(pillars);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('year pillar stem must be a non-empty string');
  });

  it('should reject empty branch', () => {
    const pillars = {
      ...validPillars,
      month: { ...validPillars.month, branch: '' },
    };
    const result = validateFourPillars(pillars);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('month pillar branch must be a non-empty string');
  });

  it('should reject empty element', () => {
    const pillars = {
      ...validPillars,
      day: { ...validPillars.day, element: '' },
    };
    const result = validateFourPillars(pillars);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('day pillar element must be a non-empty string');
  });
});

describe('validateFortune', () => {
  const validFortune: Fortune = {
    id: 'fortune-123',
    message: 'Today brings new opportunities for growth and wisdom.',
    generatedAt: new Date('2024-01-15T10:00:00.000Z'),
    expiresAt: new Date('2024-01-16T08:00:00.000Z'),
    source: 'ai',
    decorativeElements: {
      ideogram: '福',
      signature: 'Master Chen',
    },
  };

  it('should validate correct fortune data', () => {
    const result = validateFortune(validFortune);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty message', () => {
    const fortune = { ...validFortune, message: '' };
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Fortune message must be a non-empty string');
  });

  it('should reject message over 200 characters', () => {
    const fortune = { ...validFortune, message: 'a'.repeat(201) };
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Fortune message must be 200 characters or less');
  });

  it('should reject invalid source', () => {
    const fortune = { ...validFortune, source: 'invalid' as any };
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Source must be either "ai" or "fallback"');
  });

  it('should validate expiration time (8am UTC next day)', () => {
    const generatedAt = new Date('2024-01-15T15:30:00.000Z');
    const correctExpiration = new Date('2024-01-16T08:00:00.000Z');
    const fortune = {
      ...validFortune,
      generatedAt,
      expiresAt: correctExpiration,
    };
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(true);
  });

  it('should reject incorrect expiration time', () => {
    const generatedAt = new Date('2024-01-15T15:30:00.000Z');
    const wrongExpiration = new Date('2024-01-16T10:00:00.000Z'); // Should be 8am UTC
    const fortune = {
      ...validFortune,
      generatedAt,
      expiresAt: wrongExpiration,
    };
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Fortune must expire at 8am UTC the next day after generation');
  });

  it('should reject missing decorative elements', () => {
    const fortune = { ...validFortune };
    delete (fortune as any).decorativeElements;
    const result = validateFortune(fortune);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Decorative elements are required');
  });
});

describe('validateAppState', () => {
  const validAppState: AppState = {
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

  it('should validate correct app state', () => {
    const result = validateAppState(validAppState);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should allow null profile and fortune', () => {
    const result = validateAppState(validAppState);
    expect(result.isValid).toBe(true);
  });

  it('should reject missing settings', () => {
    const appState = { ...validAppState };
    delete (appState as any).settings;
    const result = validateAppState(appState);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Settings are required');
  });

  it('should reject invalid settings boolean', () => {
    const appState = {
      ...validAppState,
      settings: { ...validAppState.settings, notificationsEnabled: 'true' as any },
    };
    const result = validateAppState(appState);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('notificationsEnabled must be a boolean');
  });

  it('should reject negative analytics values', () => {
    const appState = {
      ...validAppState,
      analytics: { ...validAppState.analytics, fortunesGenerated: -1 },
    };
    const result = validateAppState(appState);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('fortunesGenerated must be a non-negative number');
  });

  it('should reject invalid lastActiveDate', () => {
    const appState = {
      ...validAppState,
      analytics: { ...validAppState.analytics, lastActiveDate: 'invalid' as any },
    };
    const result = validateAppState(appState);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('lastActiveDate must be a valid Date');
  });
});

describe('Type guard functions', () => {
  it('should correctly identify valid birth details', () => {
    const validData: BirthDetails = {
      date: new Date('1990-01-15'),
      time: '14:30',
      location: { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    };
    expect(isBirthDetails(validData)).toBe(true);
    expect(isBirthDetails({ invalid: 'data' })).toBe(false);
  });

  it('should correctly identify valid Chinese zodiac', () => {
    const validData: ChineseZodiac = { animal: 'dragon', element: 'earth', year: 1990 };
    expect(isChineseZodiac(validData)).toBe(true);
    expect(isChineseZodiac({ animal: 'invalid' })).toBe(false);
  });

  it('should correctly identify valid Four Pillars', () => {
    const validData: FourPillars = {
      year: { stem: '庚', branch: '午', element: 'metal' },
      month: { stem: '戊', branch: '寅', element: 'earth' },
      day: { stem: '甲', branch: '子', element: 'wood' },
      hour: { stem: '丙', branch: '午', element: 'fire' },
    };
    expect(isFourPillars(validData)).toBe(true);
    expect(isFourPillars({ year: 'invalid' })).toBe(false);
  });

  it('should correctly identify valid fortune', () => {
    const validData: Fortune = {
      id: 'fortune-123',
      message: 'Test message',
      generatedAt: new Date('2024-01-15T10:00:00.000Z'),
      expiresAt: new Date('2024-01-16T08:00:00.000Z'),
      source: 'ai',
      decorativeElements: { ideogram: '福', signature: 'Master Chen' },
    };
    expect(isFortune(validData)).toBe(true);
    expect(isFortune({ id: 'test' })).toBe(false);
  });

  it('should correctly identify valid app state', () => {
    const validData: AppState = {
      profile: null,
      currentFortune: null,
      lastFortuneDate: null,
      settings: { notificationsEnabled: true, soundEnabled: true, iCloudSyncEnabled: false },
      analytics: { fortunesGenerated: 0, appOpens: 1, lastActiveDate: new Date() },
    };
    expect(isAppState(validData)).toBe(true);
    expect(isAppState({ invalid: 'data' })).toBe(false);
  });
});