/**
 * Unit tests for Chinese astrology calculation service
 * Tests zodiac calculation, lunar calendar conversion, and edge cases
 */

import { calculateChineseZodiac, generateMysticalNickname, generateMysticalNicknameFromBirthDate, createAstrologicalProfile, calculateFourPillars } from '../astrology';
import { BirthDetails } from '../../types/astrology';

describe('Chinese Zodiac Calculation', () => {
  describe('calculateChineseZodiac', () => {
    test('calculates correct zodiac for known dates', () => {
      // Test known zodiac years with their animals and elements
      const testCases = [
        { date: new Date('1984-02-15'), expected: { animal: 'rat', element: 'wood', year: 1984 } },
        { date: new Date('1985-03-01'), expected: { animal: 'ox', element: 'wood', year: 1985 } },
        { date: new Date('1986-05-15'), expected: { animal: 'tiger', element: 'fire', year: 1986 } },
        { date: new Date('1987-07-20'), expected: { animal: 'rabbit', element: 'fire', year: 1987 } },
        { date: new Date('1988-08-10'), expected: { animal: 'dragon', element: 'earth', year: 1988 } },
        { date: new Date('1989-09-05'), expected: { animal: 'snake', element: 'earth', year: 1989 } },
        { date: new Date('1990-10-12'), expected: { animal: 'horse', element: 'metal', year: 1990 } },
        { date: new Date('1991-11-25'), expected: { animal: 'goat', element: 'metal', year: 1991 } },
        { date: new Date('1992-12-30'), expected: { animal: 'monkey', element: 'water', year: 1992 } },
        { date: new Date('1993-06-15'), expected: { animal: 'rooster', element: 'water', year: 1993 } },
        { date: new Date('1994-04-20'), expected: { animal: 'dog', element: 'wood', year: 1994 } },
        { date: new Date('1995-08-08'), expected: { animal: 'pig', element: 'wood', year: 1995 } }
      ];

      testCases.forEach(({ date, expected }) => {
        const result = calculateChineseZodiac(date);
        expect(result).toEqual(expected);
      });
    });

    test('handles Chinese New Year edge cases correctly', () => {
      // Test dates around Chinese New Year to ensure correct year assignment
      
      // 2020: Chinese New Year was January 25, 2020
      const beforeNewYear2020 = new Date('2020-01-20'); // Should be 2019 pig year
      const afterNewYear2020 = new Date('2020-02-01');  // Should be 2020 rat year
      
      expect(calculateChineseZodiac(beforeNewYear2020)).toEqual({
        animal: 'pig',
        element: 'earth',
        year: 2019
      });
      
      expect(calculateChineseZodiac(afterNewYear2020)).toEqual({
        animal: 'rat',
        element: 'metal',
        year: 2020
      });

      // 2021: Chinese New Year was February 12, 2021
      const beforeNewYear2021 = new Date('2021-02-10'); // Should be 2020 rat year
      const afterNewYear2021 = new Date('2021-02-15');  // Should be 2021 ox year
      
      expect(calculateChineseZodiac(beforeNewYear2021)).toEqual({
        animal: 'rat',
        element: 'metal',
        year: 2020
      });
      
      expect(calculateChineseZodiac(afterNewYear2021)).toEqual({
        animal: 'ox',
        element: 'metal',
        year: 2021
      });
    });

    test('handles early 20th century dates', () => {
      // Test historical dates to ensure algorithm works for older years
      const date1900 = new Date('1900-03-15');
      expect(calculateChineseZodiac(date1900)).toEqual({
        animal: 'rat',
        element: 'metal',
        year: 1900
      });

      const date1912 = new Date('1912-05-20');
      expect(calculateChineseZodiac(date1912)).toEqual({
        animal: 'rat',
        element: 'water',
        year: 1912
      });
    });

    test('handles future dates', () => {
      // Test future dates to ensure algorithm works for upcoming years
      const date2025 = new Date('2025-03-15');
      expect(calculateChineseZodiac(date2025)).toEqual({
        animal: 'snake',
        element: 'wood',
        year: 2025
      });

      const date2030 = new Date('2030-05-20');
      expect(calculateChineseZodiac(date2030)).toEqual({
        animal: 'dog',
        element: 'metal',
        year: 2030
      });
    });

    test('validates 12-year zodiac cycle', () => {
      // Test that zodiac animals repeat every 12 years
      const baseDate = new Date('2000-06-15');
      const baseZodiac = calculateChineseZodiac(baseDate);
      
      // Test 12 years later
      const futureDate = new Date('2012-06-15');
      const futureZodiac = calculateChineseZodiac(futureDate);
      
      expect(futureZodiac.animal).toBe(baseZodiac.animal);
      expect(futureZodiac.year).toBe(baseZodiac.year + 12);
    });

    test('validates 10-year element cycle', () => {
      // Test that elements repeat every 10 years (2 years per element * 5 elements)
      const baseDate = new Date('2000-06-15');
      const baseZodiac = calculateChineseZodiac(baseDate);
      
      // Test 10 years later
      const futureDate = new Date('2010-06-15');
      const futureZodiac = calculateChineseZodiac(futureDate);
      
      expect(futureZodiac.element).toBe(baseZodiac.element);
    });
  });

  describe('generateMysticalNickname', () => {
    test('generates nickname with correct format', async () => {
      const zodiac = { animal: 'dragon' as const, element: 'fire' as const, year: 1988 };
      const nickname = await generateMysticalNickname(zodiac);
      
      expect(nickname).toMatch(/^[A-Z][a-z]+ Dragon$/);
      expect(nickname).toContain('Dragon');
    });

    test('generates nicknames using fallback when OpenAI unavailable', async () => {
      // Test fallback functionality (OpenAI will likely fail without API key)
      const zodiac = { animal: 'pig' as const, element: 'wood' as const, year: 1995 };
      
      const nickname = await generateMysticalNickname(zodiac);
      
      // Should still generate a valid nickname using fallback
      expect(nickname).toMatch(/^[A-Z][a-z]+ Pig$/);
      expect(nickname).toContain('Pig');
      
      // Test that fallback is consistent
      const nickname2 = await generateMysticalNickname(zodiac);
      // Note: With OpenAI, results might vary, but fallback should be consistent
      expect(nickname2).toContain('Pig');
    });

    test('generates nicknames for different zodiacs', async () => {
      const zodiac1 = { animal: 'dragon' as const, element: 'fire' as const, year: 1988 };
      const zodiac2 = { animal: 'tiger' as const, element: 'wood' as const, year: 1974 };
      const zodiac3 = { animal: 'pig' as const, element: 'earth' as const, year: 2019 };
      
      const nickname1 = await generateMysticalNickname(zodiac1);
      const nickname2 = await generateMysticalNickname(zodiac2);
      const nickname3 = await generateMysticalNickname(zodiac3);
      
      // All should contain their respective animals
      expect(nickname1).toContain('Dragon');
      expect(nickname2).toContain('Tiger');
      expect(nickname3).toContain('Pig');
      
      // All should follow correct format
      expect(nickname1).toMatch(/^[A-Z][a-z]+ Dragon$/);
      expect(nickname2).toMatch(/^[A-Z][a-z]+ Tiger$/);
      expect(nickname3).toMatch(/^[A-Z][a-z]+ Pig$/);
    });

    test('uses OpenAI or fallback for creative adjectives', async () => {
      // Test that we get creative, personality-based adjectives
      const testZodiacs = [
        { animal: 'rat' as const, element: 'metal' as const, year: 2020 },
        { animal: 'ox' as const, element: 'metal' as const, year: 2021 },
        { animal: 'tiger' as const, element: 'water' as const, year: 2022 }
      ];
      
      for (const zodiac of testZodiacs) {
        const nickname = await generateMysticalNickname(zodiac);
        const adjective = nickname.split(' ')[0];
        
        // Should be a valid English adjective (starts with capital letter)
        expect(adjective).toMatch(/^[A-Z][a-z]+$/);
        
        // Should not be empty
        expect(adjective.length).toBeGreaterThan(2);
        
        // Should contain the animal name
        const expectedAnimal = zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1);
        expect(nickname).toContain(expectedAnimal);
      }
    });

    test('capitalizes animal names correctly', async () => {
      const testAnimals: Array<{ animal: any, expected: string }> = [
        { animal: 'rat', expected: 'Rat' },
        { animal: 'dragon', expected: 'Dragon' },
        { animal: 'pig', expected: 'Pig' }
      ];

      for (const { animal, expected } of testAnimals) {
        const zodiac = { animal, element: 'wood' as const, year: 2000 };
        const nickname = await generateMysticalNickname(zodiac);
        expect(nickname).toContain(expected);
      }
    });

    test('generates example nicknames like "Generous Pig"', async () => {
      // Test some specific examples to ensure quality
      const exampleZodiacs = [
        { animal: 'pig' as const, element: 'earth' as const, year: 2019 },
        { animal: 'dragon' as const, element: 'earth' as const, year: 1988 }
      ];
      
      for (const zodiac of exampleZodiacs) {
        const nickname = await generateMysticalNickname(zodiac);
        
        // Should follow the pattern "Adjective Animal"
        const parts = nickname.split(' ');
        expect(parts).toHaveLength(2);
        
        const [adjective, animal] = parts;
        expect(adjective).toMatch(/^[A-Z][a-z]+$/);
        expect(animal).toMatch(/^[A-Z][a-z]+$/);
        
        // Animal should match the zodiac animal
        const expectedAnimal = zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1);
        expect(animal).toBe(expectedAnimal);
        
        console.log(`${zodiac.animal} ${zodiac.element} ${zodiac.year} -> ${nickname}`);
      }
    });
  });

  describe('generateMysticalNicknameFromBirthDate', () => {
    test('generates nickname directly from birth date', async () => {
      const birthDate = new Date('1988-08-15'); // Earth Dragon
      const nickname = await generateMysticalNicknameFromBirthDate(birthDate);
      
      // Should follow the pattern "Adjective Animal"
      const parts = nickname.split(' ');
      expect(parts).toHaveLength(2);
      
      const [adjective, animal] = parts;
      expect(adjective).toMatch(/^[A-Z][a-z]+$/);
      expect(animal).toBe('Dragon'); // Should be Dragon for 1988
    });

    test('handles different birth years correctly', async () => {
      const testCases = [
        { date: new Date('2019-05-15'), expectedAnimal: 'Pig' },
        { date: new Date('2000-03-15'), expectedAnimal: 'Dragon' },
        { date: new Date('1995-07-20'), expectedAnimal: 'Pig' }
      ];

      for (const { date, expectedAnimal } of testCases) {
        const nickname = await generateMysticalNicknameFromBirthDate(date);
        expect(nickname).toContain(expectedAnimal);
      }
    });

    test('accounts for Chinese New Year timing', async () => {
      // Test dates around Chinese New Year to ensure correct zodiac assignment
      const earlyJanuary2020 = new Date('2020-01-15'); // Should be Pig (2019)
      const lateFeb2020 = new Date('2020-02-15'); // Should be Rat (2020)
      
      const nickname1 = await generateMysticalNicknameFromBirthDate(earlyJanuary2020);
      const nickname2 = await generateMysticalNicknameFromBirthDate(lateFeb2020);
      
      expect(nickname1).toContain('Pig');
      expect(nickname2).toContain('Rat');
    });
  });

  describe('calculateFourPillars', () => {
    test('calculates Four Pillars for known birth details', () => {
      const birthDetails: BirthDetails = {
        date: new Date('1988-08-15'),
        time: '14:30',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const pillars = calculateFourPillars(birthDetails);
      
      expect(pillars).toBeDefined();
      expect(pillars.year).toBeDefined();
      expect(pillars.month).toBeDefined();
      expect(pillars.day).toBeDefined();
      expect(pillars.hour).toBeDefined();
      
      // Each pillar should have stem, branch, and element
      expect(pillars.year.stem).toBeDefined();
      expect(pillars.year.branch).toBeDefined();
      expect(pillars.year.element).toBeDefined();
      
      expect(pillars.month.stem).toBeDefined();
      expect(pillars.month.branch).toBeDefined();
      expect(pillars.month.element).toBeDefined();
      
      expect(pillars.day.stem).toBeDefined();
      expect(pillars.day.branch).toBeDefined();
      expect(pillars.day.element).toBeDefined();
      
      expect(pillars.hour.stem).toBeDefined();
      expect(pillars.hour.branch).toBeDefined();
      expect(pillars.hour.element).toBeDefined();
    });

    test('defaults to noon when birth time is unknown', () => {
      const birthDetails: BirthDetails = {
        date: new Date('1988-08-15'),
        time: null, // Unknown time
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const pillars = calculateFourPillars(birthDetails);
      
      // Should calculate successfully with noon default
      expect(pillars).toBeDefined();
      expect(pillars.hour).toBeDefined();
      
      // Hour pillar should correspond to noon (11-13 range = 午 branch)
      expect(pillars.hour.branch).toBe('午');
    });

    test('handles different birth times correctly', () => {
      const baseBirthDetails = {
        date: new Date('1988-08-15'),
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      // Test different hours
      const morningDetails = { ...baseBirthDetails, time: '06:30' };
      const afternoonDetails = { ...baseBirthDetails, time: '15:45' };
      const nightDetails = { ...baseBirthDetails, time: '23:15' };

      const morningPillars = calculateFourPillars(morningDetails);
      const afternoonPillars = calculateFourPillars(afternoonDetails);
      const nightPillars = calculateFourPillars(nightDetails);

      // Hour pillars should be different
      expect(morningPillars.hour.branch).toBe('卯'); // 05-07 hours
      expect(afternoonPillars.hour.branch).toBe('申'); // 15-17 hours
      expect(nightPillars.hour.branch).toBe('子'); // 23-01 hours

      // Year, month, day pillars should be the same
      expect(morningPillars.year).toEqual(afternoonPillars.year);
      expect(morningPillars.month).toEqual(afternoonPillars.month);
      expect(morningPillars.day).toEqual(afternoonPillars.day);
    });

    test('calculates consistent results for same birth details', () => {
      const birthDetails: BirthDetails = {
        date: new Date('1995-12-25'),
        time: '10:15',
        location: {
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo'
        }
      };

      const pillars1 = calculateFourPillars(birthDetails);
      const pillars2 = calculateFourPillars(birthDetails);

      expect(pillars1).toEqual(pillars2);
    });

    test('handles edge cases around midnight', () => {
      const birthDetails: BirthDetails = {
        date: new Date('2000-01-01'),
        time: '00:30', // Just after midnight
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const pillars = calculateFourPillars(birthDetails);
      
      expect(pillars).toBeDefined();
      expect(pillars.hour.branch).toBe('子'); // Midnight hour
    });

    test('validates stem and branch combinations', () => {
      const birthDetails: BirthDetails = {
        date: new Date('1988-08-15'),
        time: '14:30',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const pillars = calculateFourPillars(birthDetails);
      
      // Validate that stems and branches are from correct sets
      const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const validBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const validElements = ['wood', 'fire', 'earth', 'metal', 'water'];

      expect(validStems).toContain(pillars.year.stem);
      expect(validBranches).toContain(pillars.year.branch);
      expect(validElements).toContain(pillars.year.element);

      expect(validStems).toContain(pillars.month.stem);
      expect(validBranches).toContain(pillars.month.branch);
      expect(validElements).toContain(pillars.month.element);

      expect(validStems).toContain(pillars.day.stem);
      expect(validBranches).toContain(pillars.day.branch);
      expect(validElements).toContain(pillars.day.element);

      expect(validStems).toContain(pillars.hour.stem);
      expect(validBranches).toContain(pillars.hour.branch);
      expect(validElements).toContain(pillars.hour.element);
    });

    test('handles different years correctly', () => {
      const testCases = [
        { year: 1984, expectedYearStem: '甲', expectedYearBranch: '子' }, // Rat year
        { year: 1985, expectedYearStem: '乙', expectedYearBranch: '丑' }, // Ox year
        { year: 2000, expectedYearStem: '庚', expectedYearBranch: '辰' }, // Dragon year
        { year: 2020, expectedYearStem: '庚', expectedYearBranch: '子' }  // Rat year
      ];

      testCases.forEach(({ year, expectedYearStem, expectedYearBranch }) => {
        const birthDetails: BirthDetails = {
          date: new Date(`${year}-06-15`),
          time: '12:00',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York'
          }
        };

        const pillars = calculateFourPillars(birthDetails);
        expect(pillars.year.stem).toBe(expectedYearStem);
        expect(pillars.year.branch).toBe(expectedYearBranch);
      });
    });

    test('handles leap years correctly', () => {
      const leapYearDetails: BirthDetails = {
        date: new Date('2000-02-29'), // Leap year date
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const pillars = calculateFourPillars(leapYearDetails);
      expect(pillars).toBeDefined();
      expect(pillars.year.branch).toBe('辰'); // Dragon year 2000
    });

    test('handles Chinese New Year boundary correctly', () => {
      // Test dates around Chinese New Year to ensure correct year pillar
      const beforeNewYear: BirthDetails = {
        date: new Date('2020-01-20'), // Before Chinese New Year 2020 (Jan 25)
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const afterNewYear: BirthDetails = {
        date: new Date('2020-02-01'), // After Chinese New Year 2020
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const beforePillars = calculateFourPillars(beforeNewYear);
      const afterPillars = calculateFourPillars(afterNewYear);

      // Before New Year should be 2019 (Pig year), after should be 2020 (Rat year)
      expect(beforePillars.year.branch).toBe('亥'); // Pig
      expect(afterPillars.year.branch).toBe('子'); // Rat
    });
  });

  describe('createAstrologicalProfile', () => {
    test('creates profile with zodiac, nickname, and pillars', async () => {
      const birthDetails: BirthDetails = {
        date: new Date('1988-08-15'),
        time: '14:30',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const profile = await createAstrologicalProfile(birthDetails);
      
      expect(profile.zodiac).toBeDefined();
      expect(profile.zodiac?.animal).toBe('dragon');
      expect(profile.zodiac?.element).toBe('earth');
      expect(profile.zodiac?.year).toBe(1988);
      
      expect(profile.mysticalNickname).toBeDefined();
      expect(profile.mysticalNickname).toContain('Dragon');
      
      expect(profile.pillars).toBeDefined();
      expect(profile.pillars?.year).toBeDefined();
      expect(profile.pillars?.month).toBeDefined();
      expect(profile.pillars?.day).toBeDefined();
      expect(profile.pillars?.hour).toBeDefined();
    });

    test('handles different birth locations and unknown time', async () => {
      const birthDetails: BirthDetails = {
        date: new Date('1995-12-25'),
        time: null, // Unknown time - should default to noon
        location: {
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo'
        }
      };

      const profile = await createAstrologicalProfile(birthDetails);
      
      expect(profile.zodiac).toBeDefined();
      expect(profile.zodiac?.animal).toBe('pig');
      expect(profile.zodiac?.element).toBe('wood');
      
      expect(profile.pillars).toBeDefined();
      expect(profile.pillars?.hour.branch).toBe('午'); // Noon hour
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles leap year dates', () => {
      const leapYearDate = new Date('2000-02-29');
      const zodiac = calculateChineseZodiac(leapYearDate);
      
      expect(zodiac).toBeDefined();
      expect(zodiac.animal).toBe('dragon');
      expect(zodiac.element).toBe('metal');
    });

    test('handles year boundaries correctly', () => {
      // Test December 31st and January 1st of consecutive years
      const dec31 = new Date('1999-12-31');
      const jan1 = new Date('2000-01-01');
      
      const dec31Zodiac = calculateChineseZodiac(dec31);
      const jan1Zodiac = calculateChineseZodiac(jan1);
      
      // Both should be rabbit year (1999) since Chinese New Year 2000 was Feb 5
      expect(dec31Zodiac.year).toBe(1999);
      expect(jan1Zodiac.year).toBe(1999);
      expect(dec31Zodiac.animal).toBe('rabbit');
      expect(jan1Zodiac.animal).toBe('rabbit');
    });

    test('handles very old dates', () => {
      const oldDate = new Date('1850-06-15');
      const zodiac = calculateChineseZodiac(oldDate);
      
      expect(zodiac).toBeDefined();
      expect(zodiac.year).toBe(1850);
      // Should still calculate correctly even without exact New Year data
    });

    test('handles very future dates', () => {
      const futureDate = new Date('2100-06-15');
      const zodiac = calculateChineseZodiac(futureDate);
      
      expect(zodiac).toBeDefined();
      expect(zodiac.year).toBe(2100);
      // Should still calculate correctly even without exact New Year data
    });
  });
});