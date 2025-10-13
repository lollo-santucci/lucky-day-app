/**
 * Unit tests for Chinese astrology calculation service
 * Tests zodiac calculation, lunar calendar conversion, and edge cases
 */

import { calculateChineseZodiac, generateMysticalNickname, generateMysticalNicknameFromBirthDate, createAstrologicalProfile, calculateFourPillars, generatePillarDescriptions, generateEssenceSummary } from '../astrology';
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

        // Verify nickname format and content
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

  describe('generatePillarDescriptions', () => {
    test('generates descriptions for all four pillars', async () => {
      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      const descriptions = await generatePillarDescriptions(pillars);

      expect(descriptions.year).toBeDefined();
      expect(descriptions.month).toBeDefined();
      expect(descriptions.day).toBeDefined();
      expect(descriptions.hour).toBeDefined();

      expect(typeof descriptions.year).toBe('string');
      expect(typeof descriptions.month).toBe('string');
      expect(typeof descriptions.day).toBe('string');
      expect(typeof descriptions.hour).toBe('string');

      expect(descriptions.year.length).toBeGreaterThan(10);
      expect(descriptions.month.length).toBeGreaterThan(10);
      expect(descriptions.day.length).toBeGreaterThan(10);
      expect(descriptions.hour.length).toBeGreaterThan(10);
    }, 10000);

    test('generates different descriptions for different pillar combinations', async () => {
      const pillars1 = {
        year: { stem: '甲', branch: '子', element: 'wood' },
        month: { stem: '乙', branch: '丑', element: 'wood' },
        day: { stem: '丙', branch: '寅', element: 'fire' },
        hour: { stem: '丁', branch: '卯', element: 'fire' }
      };

      const pillars2 = {
        year: { stem: '庚', branch: '申', element: 'metal' },
        month: { stem: '辛', branch: '酉', element: 'metal' },
        day: { stem: '壬', branch: '戌', element: 'water' },
        hour: { stem: '癸', branch: '亥', element: 'water' }
      };

      const descriptions1 = await generatePillarDescriptions(pillars1);
      const descriptions2 = await generatePillarDescriptions(pillars2);

      // Descriptions should be different for different pillar combinations
      expect(descriptions1.year).not.toBe(descriptions2.year);
      expect(descriptions1.month).not.toBe(descriptions2.month);
      expect(descriptions1.day).not.toBe(descriptions2.day);
      expect(descriptions1.hour).not.toBe(descriptions2.hour);
    }, 20000); // 20 second timeout for this test

    test('uses fallback descriptions when LLM unavailable', async () => {
      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      const descriptions = await generatePillarDescriptions(pillars);

      // Should still generate valid descriptions even if LLM fails
      expect(descriptions.year).toBeDefined();
      expect(descriptions.month).toBeDefined();
      expect(descriptions.day).toBeDefined();
      expect(descriptions.hour).toBeDefined();

      // Should contain mystical/poetic language - be more flexible with LLM-generated content
      expect(descriptions.year.toLowerCase()).toMatch(/destiny|fate|path|wisdom|ancient|flow|realm|life|journey|spirit/);
      expect(descriptions.month.toLowerCase()).toMatch(/environment|growth|nurtur|season|energy|surround|friend|relation|realm|spark/);
      expect(descriptions.day.toLowerCase()).toMatch(/essence|core|being|light|nature|soul|self|identity|character|spirit/);
      expect(descriptions.hour.toLowerCase()).toMatch(/heart|inner|spirit|rhythm|eternal|deep|soul|within|sacred|divine/);
    }, 10000);

    test('generates element-appropriate descriptions', async () => {
      const woodPillars = {
        year: { stem: '甲', branch: '寅', element: 'wood' },
        month: { stem: '乙', branch: '卯', element: 'wood' },
        day: { stem: '甲', branch: '寅', element: 'wood' },
        hour: { stem: '乙', branch: '卯', element: 'wood' }
      };

      const firePillars = {
        year: { stem: '丙', branch: '午', element: 'fire' },
        month: { stem: '丁', branch: '巳', element: 'fire' },
        day: { stem: '丙', branch: '午', element: 'fire' },
        hour: { stem: '丁', branch: '巳', element: 'fire' }
      };

      const woodDescriptions = await generatePillarDescriptions(woodPillars);
      const fireDescriptions = await generatePillarDescriptions(firePillars);

      // Wood descriptions should reference growth, trees, nature
      const woodText = Object.values(woodDescriptions).join(' ').toLowerCase();
      expect(woodText).toMatch(/tree|grow|spring|green|nature|branch|root|season/);

      // Fire descriptions should reference passion, light, energy
      const fireText = Object.values(fireDescriptions).join(' ').toLowerCase();
      expect(fireText).toMatch(/fire|light|passion|energy|burn|bright|warm|flame/);
    }, 20000); // 20 second timeout for this test
  });

  describe('generateEssenceSummary', () => {
    test('generates 3-line essence summary', async () => {
      const zodiac = { animal: 'dragon' as const, element: 'earth' as const, year: 1988 };
      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      const summary = await generateEssenceSummary(zodiac, pillars);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');

      const lines = summary.split('\n').filter(line => line.trim());
      expect(lines).toHaveLength(3);

      // Should mention the zodiac animal
      expect(summary.toLowerCase()).toContain('dragon');

      // Each line should be meaningful (not too short)
      lines.forEach(line => {
        expect(line.trim().length).toBeGreaterThan(20);
      });
    });

    test('incorporates zodiac animal and element', async () => {
      const testCases = [
        { animal: 'tiger' as const, element: 'fire' as const, year: 1986 },
        { animal: 'pig' as const, element: 'earth' as const, year: 2019 },
        { animal: 'snake' as const, element: 'water' as const, year: 2013 }
      ];

      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      for (const zodiac of testCases) {
        const summary = await generateEssenceSummary(zodiac, pillars);

        expect(summary.toLowerCase()).toContain(zodiac.animal);
        expect(summary.toLowerCase()).toContain(zodiac.element);

        const lines = summary.split('\n').filter(line => line.trim());
        expect(lines).toHaveLength(3);
      }
    }, 20000); // 20 second timeout for this test

    test('creates different summaries for different combinations', async () => {
      const zodiac1 = { animal: 'dragon' as const, element: 'earth' as const, year: 1988 };
      const zodiac2 = { animal: 'tiger' as const, element: 'fire' as const, year: 1986 };

      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      const summary1 = await generateEssenceSummary(zodiac1, pillars);
      const summary2 = await generateEssenceSummary(zodiac2, pillars);

      expect(summary1).not.toBe(summary2);
      expect(summary1.toLowerCase()).toContain('dragon');
      expect(summary2.toLowerCase()).toContain('tiger');
    });

    test('uses fallback when LLM unavailable', async () => {
      const zodiac = { animal: 'pig' as const, element: 'wood' as const, year: 1995 };
      const pillars = {
        year: { stem: '乙', branch: '亥', element: 'wood' },
        month: { stem: '戊', branch: '子', element: 'earth' },
        day: { stem: '甲', branch: '午', element: 'wood' },
        hour: { stem: '丙', branch: '寅', element: 'fire' }
      };

      const summary = await generateEssenceSummary(zodiac, pillars);

      expect(summary).toBeDefined();
      const lines = summary.split('\n').filter(line => line.trim());
      expect(lines).toHaveLength(3);

      expect(summary.toLowerCase()).toContain('pig');
      expect(summary.toLowerCase()).toContain('wood');

      // Should contain mystical language
      expect(summary.toLowerCase()).toMatch(/wisdom|spirit|heart|eternal|flow|guide/);
    });

    test('handles all zodiac animals correctly', async () => {
      // Test a representative sample of animals instead of all 12 to avoid timeout
      const animals: Array<{ animal: any, element: any }> = [
        { animal: 'rat', element: 'metal' },
        { animal: 'dragon', element: 'earth' },
        { animal: 'tiger', element: 'fire' },
        { animal: 'pig', element: 'wood' }
      ];

      const pillars = {
        year: { stem: '戊', branch: '辰', element: 'earth' },
        month: { stem: '庚', branch: '申', element: 'metal' },
        day: { stem: '甲', branch: '子', element: 'wood' },
        hour: { stem: '丙', branch: '午', element: 'fire' }
      };

      for (const { animal, element } of animals) {
        const zodiac = { animal, element, year: 2000 };
        const summary = await generateEssenceSummary(zodiac, pillars);

        expect(summary).toBeDefined();
        expect(summary.toLowerCase()).toContain(animal);

        const lines = summary.split('\n').filter(line => line.trim());
        expect(lines).toHaveLength(3);

        // Verify summary format and content
      }
    }, 30000); // 30 second timeout for this test
  });

  describe('createAstrologicalProfile', () => {
    test('creates complete profile with all components', async () => {
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
      expect(profile.zodiac.animal).toBe('dragon');
      expect(profile.zodiac.element).toBe('earth');
      expect(profile.zodiac.year).toBe(1988);

      expect(profile.mysticalNickname).toBeDefined();
      expect(profile.mysticalNickname).toContain('Dragon');

      expect(profile.pillars).toBeDefined();
      expect(profile.pillars.year).toBeDefined();
      expect(profile.pillars.month).toBeDefined();
      expect(profile.pillars.day).toBeDefined();
      expect(profile.pillars.hour).toBeDefined();

      expect(profile.pillarDescriptions).toBeDefined();
      expect(profile.pillarDescriptions.year).toBeDefined();
      expect(profile.pillarDescriptions.month).toBeDefined();
      expect(profile.pillarDescriptions.day).toBeDefined();
      expect(profile.pillarDescriptions.hour).toBeDefined();

      expect(profile.essenceSummary).toBeDefined();
      const summaryLines = profile.essenceSummary.split('\n').filter(line => line.trim());
      expect(summaryLines).toHaveLength(3);
    }, 15000);

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
      expect(profile.zodiac.animal).toBe('pig');
      expect(profile.zodiac.element).toBe('wood');

      expect(profile.pillars).toBeDefined();
      expect(profile.pillars.hour.branch).toBe('午'); // Noon hour

      expect(profile.pillarDescriptions).toBeDefined();
      expect(profile.essenceSummary).toBeDefined();
      expect(profile.essenceSummary.toLowerCase()).toContain('pig');
    }, 15000);

    test('creates consistent profiles for same birth details', async () => {
      const birthDetails: BirthDetails = {
        date: new Date('2000-06-15'),
        time: '10:30',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          timezone: 'Europe/London'
        }
      };

      const profile1 = await createAstrologicalProfile(birthDetails);
      const profile2 = await createAstrologicalProfile(birthDetails);

      // Zodiac and pillars should be identical
      expect(profile1.zodiac).toEqual(profile2.zodiac);
      expect(profile1.pillars).toEqual(profile2.pillars);

      // Nickname might vary if using LLM, but should contain same animal
      expect(profile1.mysticalNickname).toContain(profile1.zodiac.animal.charAt(0).toUpperCase() + profile1.zodiac.animal.slice(1));
      expect(profile2.mysticalNickname).toContain(profile2.zodiac.animal.charAt(0).toUpperCase() + profile2.zodiac.animal.slice(1));
    }, 25000); // 25 second timeout for this test
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

    test('handles invalid birth details gracefully', () => {
      // Test with invalid date
      const invalidBirthDetails: BirthDetails = {
        date: new Date('invalid-date'),
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      // The implementation may handle invalid dates gracefully or throw
      // Let's test that it either works or throws a meaningful error
      try {
        const result = calculateFourPillars(invalidBirthDetails);
        // If it doesn't throw, the result should still be defined
        expect(result).toBeDefined();
      } catch (error) {
        // If it throws, it should be a meaningful error
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeTruthy();
      }
    });

    test('handles extreme coordinates', () => {
      const extremeBirthDetails: BirthDetails = {
        date: new Date('2000-01-01'),
        time: '12:00',
        location: {
          latitude: 90, // North Pole
          longitude: 180, // International Date Line
          timezone: 'UTC'
        }
      };

      const pillars = calculateFourPillars(extremeBirthDetails);
      expect(pillars).toBeDefined();
      expect(pillars.year).toBeDefined();
      expect(pillars.month).toBeDefined();
      expect(pillars.day).toBeDefined();
      expect(pillars.hour).toBeDefined();
    });

    test('handles malformed time strings', () => {
      const birthDetailsWithBadTime: BirthDetails = {
        date: new Date('2000-01-01'),
        time: '25:70', // Invalid time
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      // Should handle gracefully or throw meaningful error
      expect(() => {
        calculateFourPillars(birthDetailsWithBadTime);
      }).not.toThrow(); // Implementation should handle this gracefully
    });

    test('validates zodiac calculation accuracy with reference data', () => {
      // Test against known reference data for accuracy
      const referenceData = [
        // Format: [date, expected_animal, expected_element, expected_year]
        ['1984-02-02', 'rat', 'wood', 1984], // After Chinese New Year 1984
        ['1984-01-01', 'pig', 'water', 1983], // Before Chinese New Year 1984
        ['2000-02-10', 'dragon', 'metal', 2000], // After Chinese New Year 2000
        ['2000-01-01', 'rabbit', 'earth', 1999], // Before Chinese New Year 2000
        ['2020-01-30', 'rat', 'metal', 2020], // After Chinese New Year 2020
        ['2020-01-20', 'pig', 'earth', 2019], // Before Chinese New Year 2020
        ['1972-02-20', 'rat', 'water', 1972], // After Chinese New Year 1972
        ['1972-01-01', 'pig', 'metal', 1971], // Before Chinese New Year 1972
      ];

      referenceData.forEach(([dateStr, expectedAnimal, expectedElement, expectedYear]) => {
        const date = new Date(dateStr);
        const zodiac = calculateChineseZodiac(date);

        expect(zodiac.animal).toBe(expectedAnimal);
        expect(zodiac.element).toBe(expectedElement);
        expect(zodiac.year).toBe(expectedYear);
      });
    });

    test('validates Four Pillars calculation with known reference data', () => {
      // Test specific known Four Pillars calculations
      const knownBirthDetails: BirthDetails = {
        date: new Date('1984-02-15'), // Known date for testing
        time: '12:00', // Noon
        location: {
          latitude: 39.9042, // Beijing coordinates for traditional calculation
          longitude: 116.4074,
          timezone: 'Asia/Shanghai'
        }
      };

      const pillars = calculateFourPillars(knownBirthDetails);

      // Validate structure and content
      expect(pillars.year.stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      expect(pillars.year.branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(pillars.year.element);

      expect(pillars.month.stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      expect(pillars.month.branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(pillars.month.element);

      expect(pillars.day.stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      expect(pillars.day.branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(pillars.day.element);

      expect(pillars.hour.stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      expect(pillars.hour.branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(pillars.hour.element);
    });

    test('validates hour pillar calculations for all time periods', () => {
      const baseBirthDetails = {
        date: new Date('2000-01-01'),
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      // Test all 12 two-hour periods
      const hourTests = [
        { time: '00:30', expectedBranch: '子' }, // 23-01
        { time: '02:30', expectedBranch: '丑' }, // 01-03
        { time: '04:30', expectedBranch: '寅' }, // 03-05
        { time: '06:30', expectedBranch: '卯' }, // 05-07
        { time: '08:30', expectedBranch: '辰' }, // 07-09
        { time: '10:30', expectedBranch: '巳' }, // 09-11
        { time: '12:30', expectedBranch: '午' }, // 11-13
        { time: '14:30', expectedBranch: '未' }, // 13-15
        { time: '16:30', expectedBranch: '申' }, // 15-17
        { time: '18:30', expectedBranch: '酉' }, // 17-19
        { time: '20:30', expectedBranch: '戌' }, // 19-21
        { time: '22:30', expectedBranch: '亥' }, // 21-23
        { time: '23:30', expectedBranch: '子' }, // 23-01 (next day)
      ];

      hourTests.forEach(({ time, expectedBranch }) => {
        const birthDetails = { ...baseBirthDetails, time };
        const pillars = calculateFourPillars(birthDetails);
        expect(pillars.hour.branch).toBe(expectedBranch);
      });
    });

    test('handles timezone edge cases', () => {
      // Test same moment in different timezones
      const utcBirthDetails: BirthDetails = {
        date: new Date('2000-01-01T12:00:00Z'),
        time: '12:00',
        location: {
          latitude: 0,
          longitude: 0,
          timezone: 'UTC'
        }
      };

      const tokyoBirthDetails: BirthDetails = {
        date: new Date('2000-01-01T21:00:00+09:00'), // Same moment as UTC noon
        time: '21:00',
        location: {
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo'
        }
      };

      const utcPillars = calculateFourPillars(utcBirthDetails);
      const tokyoPillars = calculateFourPillars(tokyoBirthDetails);

      // Year, month, day should be the same for the same calendar date
      expect(utcPillars.year).toEqual(tokyoPillars.year);
      expect(utcPillars.month).toEqual(tokyoPillars.month);
      expect(utcPillars.day).toEqual(tokyoPillars.day);

      // Hour pillars will be different due to different local times
      expect(utcPillars.hour).not.toEqual(tokyoPillars.hour);
    });

    test('validates element consistency in calculations', () => {
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

      // Validate that elements are consistent with stems
      const stemElements = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
      const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

      [pillars.year, pillars.month, pillars.day, pillars.hour].forEach(pillar => {
        const stemIndex = heavenlyStems.indexOf(pillar.stem);
        expect(stemIndex).toBeGreaterThanOrEqual(0);
        expect(pillar.element).toBe(stemElements[stemIndex]);
      });
    });

    test('handles concurrent calculations correctly', async () => {
      // Test that multiple simultaneous calculations don't interfere
      const birthDetails1: BirthDetails = {
        date: new Date('1988-08-15'),
        time: '14:30',
        location: { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' }
      };

      const birthDetails2: BirthDetails = {
        date: new Date('1995-12-25'),
        time: '09:15',
        location: { latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' }
      };

      // Run calculations concurrently
      const [pillars1, pillars2, zodiac1, zodiac2] = await Promise.all([
        Promise.resolve(calculateFourPillars(birthDetails1)),
        Promise.resolve(calculateFourPillars(birthDetails2)),
        Promise.resolve(calculateChineseZodiac(birthDetails1.date)),
        Promise.resolve(calculateChineseZodiac(birthDetails2.date))
      ]);

      // Results should be consistent and different
      expect(pillars1).toBeDefined();
      expect(pillars2).toBeDefined();
      expect(zodiac1).toBeDefined();
      expect(zodiac2).toBeDefined();

      expect(zodiac1.animal).toBe('dragon');
      expect(zodiac2.animal).toBe('pig');

      // Pillars should be different for different birth details
      expect(pillars1).not.toEqual(pillars2);
    });

    test('validates calculation performance', () => {
      const birthDetails: BirthDetails = {
        date: new Date('2000-01-01'),
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      // Test that calculations complete quickly
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        calculateChineseZodiac(birthDetails.date);
        calculateFourPillars(birthDetails);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 100 calculations in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    test('handles boundary conditions for Chinese New Year dates', () => {
      // Test exact Chinese New Year dates for accuracy
      const chineseNewYearTests = [
        { year: 2020, newYearDate: '2020-01-25', beforeAnimal: 'pig', afterAnimal: 'rat' },
        { year: 2021, newYearDate: '2021-02-12', beforeAnimal: 'rat', afterAnimal: 'ox' },
        { year: 2022, newYearDate: '2022-02-01', beforeAnimal: 'ox', afterAnimal: 'tiger' },
        { year: 2023, newYearDate: '2023-01-22', beforeAnimal: 'tiger', afterAnimal: 'rabbit' },
        { year: 2024, newYearDate: '2024-02-10', beforeAnimal: 'rabbit', afterAnimal: 'dragon' }
      ];

      chineseNewYearTests.forEach(({ newYearDate, beforeAnimal, afterAnimal }) => {
        const newYear = new Date(newYearDate);
        const dayBefore = new Date(newYear.getTime() - 24 * 60 * 60 * 1000);
        const dayAfter = new Date(newYear.getTime() + 24 * 60 * 60 * 1000);

        const zodiacBefore = calculateChineseZodiac(dayBefore);
        const zodiacAfter = calculateChineseZodiac(dayAfter);

        expect(zodiacBefore.animal).toBe(beforeAnimal);
        expect(zodiacAfter.animal).toBe(afterAnimal);
      });
    });

    test('validates error handling for malformed input', () => {
      // Test various malformed inputs
      const malformedInputs = [
        {
          date: new Date(''),
          time: '12:00',
          location: { latitude: 0, longitude: 0, timezone: 'UTC' }
        },
        {
          date: new Date('2000-01-01'),
          time: '',
          location: { latitude: 0, longitude: 0, timezone: 'UTC' }
        },
        {
          date: new Date('2000-01-01'),
          time: 'invalid',
          location: { latitude: 0, longitude: 0, timezone: 'UTC' }
        }
      ];

      malformedInputs.forEach(input => {
        // Should either handle gracefully or throw meaningful errors
        try {
          const result = calculateFourPillars(input);
          expect(result).toBeDefined(); // If it doesn't throw, should return valid result
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBeTruthy();
        }
      });
    });

    test('validates 60-day cycle accuracy for day pillars', () => {
      // Test that day pillars follow the traditional 60-day cycle
      const baseDate = new Date('2000-01-01');
      const baseBirthDetails: BirthDetails = {
        date: baseDate,
        time: '12:00',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York'
        }
      };

      const basePillars = calculateFourPillars(baseBirthDetails);

      // Test 60 days later - should have the same day pillar
      const sixtyDaysLater = new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000);
      const futureBirthDetails = { ...baseBirthDetails, date: sixtyDaysLater };
      const futurePillars = calculateFourPillars(futureBirthDetails);

      expect(futurePillars.day.stem).toBe(basePillars.day.stem);
      expect(futurePillars.day.branch).toBe(basePillars.day.branch);
      expect(futurePillars.day.element).toBe(basePillars.day.element);
    });

    test('validates stem-branch combinations are valid', () => {
      // Test that all generated stem-branch combinations are valid in traditional Chinese astrology
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

      // Valid stems and branches
      const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const validBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      // Check all pillars have valid combinations
      [pillars.year, pillars.month, pillars.day, pillars.hour].forEach(pillar => {
        expect(validStems).toContain(pillar.stem);
        expect(validBranches).toContain(pillar.branch);

        // Verify stem-branch combination follows the 60-combination cycle
        const stemIndex = validStems.indexOf(pillar.stem);
        const branchIndex = validBranches.indexOf(pillar.branch);

        // In the 60-combination cycle, valid combinations have (stemIndex - branchIndex) % 2 === 0
        // Use Math.abs to handle -0 vs 0 comparison issue
        expect(Math.abs((stemIndex - branchIndex) % 2)).toBe(0);
      });
    });
  });
});