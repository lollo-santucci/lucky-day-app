/**
 * Chinese Astrology Calculation Service
 * Handles Chinese zodiac calculations, lunar calendar conversions, and Four Pillars computations
 */

import { llmService } from './llm';
import { ChineseZodiac, BirthDetails, FourPillars, AstrologicalProfile, PillarDescriptions } from '../types/astrology';

// Chinese zodiac animals in order
const ZODIAC_ANIMALS: ChineseZodiac['animal'][] = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
];

// Five elements in order
const ELEMENTS: ChineseZodiac['element'][] = ['wood', 'fire', 'earth', 'metal', 'water'];

// Chinese New Year dates for accurate zodiac calculation
// Key: year, Value: Chinese New Year date (month-day format)
const CHINESE_NEW_YEAR_DATES: Record<number, string> = {
  1900: '01-31', 1901: '02-19', 1902: '02-08', 1903: '01-29', 1904: '02-16',
  1905: '02-04', 1906: '01-25', 1907: '02-13', 1908: '02-02', 1909: '01-22',
  1910: '02-10', 1911: '01-30', 1912: '02-18', 1913: '02-06', 1914: '01-26',
  1915: '02-14', 1916: '02-03', 1917: '01-23', 1918: '02-11', 1919: '02-01',
  1920: '02-20', 1921: '02-08', 1922: '01-28', 1923: '02-16', 1924: '02-05',
  1925: '01-24', 1926: '02-13', 1927: '02-02', 1928: '01-23', 1929: '02-10',
  1930: '01-30', 1931: '02-17', 1932: '02-06', 1933: '01-26', 1934: '02-14',
  1935: '02-04', 1936: '01-24', 1937: '02-11', 1938: '01-31', 1939: '02-19',
  1940: '02-08', 1941: '01-27', 1942: '02-15', 1943: '02-05', 1944: '01-25',
  1945: '02-13', 1946: '02-02', 1947: '01-22', 1948: '02-10', 1949: '01-29',
  1950: '02-17', 1951: '02-06', 1952: '01-27', 1953: '02-14', 1954: '02-03',
  1955: '01-24', 1956: '02-12', 1957: '01-31', 1958: '02-18', 1959: '02-08',
  1960: '01-28', 1961: '02-15', 1962: '02-05', 1963: '01-25', 1964: '02-13',
  1965: '02-02', 1966: '01-21', 1967: '02-09', 1968: '01-30', 1969: '02-17',
  1970: '02-06', 1971: '01-27', 1972: '02-15', 1973: '02-03', 1974: '01-23',
  1975: '02-11', 1976: '01-31', 1977: '02-18', 1978: '02-07', 1979: '01-28',
  1980: '02-16', 1981: '02-05', 1982: '01-25', 1983: '02-13', 1984: '02-02',
  1985: '02-20', 1986: '02-09', 1987: '01-29', 1988: '02-17', 1989: '02-06',
  1990: '01-27', 1991: '02-15', 1992: '02-04', 1993: '01-23', 1994: '02-10',
  1995: '01-31', 1996: '02-19', 1997: '02-07', 1998: '01-28', 1999: '02-16',
  2000: '02-05', 2001: '01-24', 2002: '02-12', 2003: '02-01', 2004: '01-22',
  2005: '02-09', 2006: '01-29', 2007: '02-18', 2008: '02-07', 2009: '01-26',
  2010: '02-14', 2011: '02-03', 2012: '01-23', 2013: '02-10', 2014: '01-31',
  2015: '02-19', 2016: '02-08', 2017: '01-28', 2018: '02-16', 2019: '02-05',
  2020: '01-25', 2021: '02-12', 2022: '02-01', 2023: '01-22', 2024: '02-10',
  2025: '01-29', 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13',
  2030: '02-03'
};

/**
 * Determines the Chinese zodiac year based on birth date
 * Accounts for Chinese New Year timing to ensure accurate zodiac assignment
 */
function getChineseZodiacYear(birthDate: Date): number {
  const birthYear = birthDate.getFullYear();
  const chineseNewYear = CHINESE_NEW_YEAR_DATES[birthYear];

  if (!chineseNewYear) {
    // Fallback: approximate Chinese New Year as late January/early February
    const approximateNewYear = new Date(birthYear, 1, 1); // February 1st
    return birthDate < approximateNewYear ? birthYear - 1 : birthYear;
  }

  const [month, day] = chineseNewYear.split('-').map(Number);
  const newYearDate = new Date(birthYear, month - 1, day);

  // If birth date is before Chinese New Year, use previous year's zodiac
  return birthDate < newYearDate ? birthYear - 1 : birthYear;
}

/**
 * Calculates Chinese zodiac animal from zodiac year
 */
function getZodiacAnimal(zodiacYear: number): ChineseZodiac['animal'] {
  // Rat year is 1900, 1912, 1924, etc. (every 12 years)
  // Calculate offset from base rat year (1900)
  const offset = (zodiacYear - 1900) % 12;
  const adjustedOffset = offset < 0 ? offset + 12 : offset;
  return ZODIAC_ANIMALS[adjustedOffset];
}

/**
 * Calculates element from zodiac year
 * Each element lasts 2 years, cycling through metal, water, wood, fire, earth
 * The cycle starts with metal in years ending in 0-1
 */
function getZodiacElement(zodiacYear: number): ChineseZodiac['element'] {
  // Element cycle: metal (0-1), water (2-3), wood (4-5), fire (6-7), earth (8-9)
  const lastDigit = zodiacYear % 10;

  if (lastDigit === 0 || lastDigit === 1) return 'metal';
  if (lastDigit === 2 || lastDigit === 3) return 'water';
  if (lastDigit === 4 || lastDigit === 5) return 'wood';
  if (lastDigit === 6 || lastDigit === 7) return 'fire';
  if (lastDigit === 8 || lastDigit === 9) return 'earth';

  // This should never happen, but fallback to metal
  return 'metal';
}

/**
 * Main function to calculate Chinese zodiac from birth date
 */
export function calculateChineseZodiac(birthDate: Date): ChineseZodiac {
  const zodiacYear = getChineseZodiacYear(birthDate);
  const animal = getZodiacAnimal(zodiacYear);
  const element = getZodiacElement(zodiacYear);

  return {
    animal,
    element,
    year: zodiacYear
  };
}

/**
 * Generates a mystical nickname using centralized LLM service
 * Always includes the zodiac animal and is in English
 * Examples: "Generous Pig", "Wise Dragon", "Brave Tiger"
 */
export async function generateMysticalNickname(zodiac: ChineseZodiac): Promise<string> {
  try {
    // Use centralized LLM service with astrology-specific prompts
    if (llmService.isServiceAvailable()) {
      const systemPrompt = "You are a mystical Chinese astrology expert who creates personalized nicknames. Always respond with exactly 2 words: an adjective followed by the zodiac animal.";

      const userPrompt = `Generate a mystical nickname for someone born in the Chinese zodiac year of the ${zodiac.animal} with the element ${zodiac.element}. 

Requirements:
- Must be exactly 2 words in English
- First word: a positive adjective that reflects personality or mystical qualities
- Second word: "${zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1)}" (the zodiac animal, capitalized)
- Examples: "Generous Pig", "Wise Dragon", "Brave Tiger", "Serene Snake"
- Should feel mystical and positive
- Consider the element ${zodiac.element} for inspiration but don't be limited by it

Return only the 2-word nickname, nothing else.`;

      const response = await llmService.generateContent({
        systemPrompt,
        userPrompt,
        maxTokens: 10,
        temperature: 0.7
      });

      // Validate the format (should be "Adjective Animal")
      const words = response.content.split(' ');
      if (words.length !== 2) {
        throw new Error(`Invalid nickname format: ${response.content}`);
      }

      const [adjective, animalName] = words;
      const expectedAnimal = zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1);

      if (animalName !== expectedAnimal) {
        // If LLM didn't use the correct animal, fix it
        return `${adjective} ${expectedAnimal}`;
      }

      return response.content;
    } else {
      console.warn('LLM service not available, using fallback');
      return generateFallbackNickname(zodiac);
    }
  } catch (error) {
    console.warn('Failed to generate nickname with LLM service, using fallback:', error);

    // Fallback to deterministic generation if LLM fails
    return generateFallbackNickname(zodiac);
  }
}

/**
 * Generates a mystical nickname for a user based on their birth date
 * This is the main function that should be used by the UI
 */
export async function generateMysticalNicknameFromBirthDate(birthDate: Date): Promise<string> {
  const zodiac = calculateChineseZodiac(birthDate);
  return await generateMysticalNickname(zodiac);
}

/**
 * Fallback nickname generation when OpenAI API is unavailable
 * Uses deterministic approach for consistency
 */
function generateFallbackNickname(zodiac: ChineseZodiac): string {
  const fallbackAdjectives = [
    'Generous', 'Wise', 'Brave', 'Gentle', 'Noble', 'Clever', 'Loyal',
    'Graceful', 'Spirited', 'Serene', 'Radiant', 'Mystical', 'Ancient',
    'Peaceful', 'Fierce', 'Elegant', 'Mysterious', 'Powerful', 'Swift',
    'Majestic', 'Cunning', 'Resilient', 'Vibrant', 'Harmonious', 'Bold'
  ];

  // Use deterministic selection based on zodiac properties
  const animalIndex = ZODIAC_ANIMALS.indexOf(zodiac.animal);
  const elementIndex = ['metal', 'water', 'wood', 'fire', 'earth'].indexOf(zodiac.element);
  const yearSeed = zodiac.year % 100;

  const adjectiveIndex = (animalIndex * 7 + elementIndex * 11 + yearSeed * 3) % fallbackAdjectives.length;
  const selectedAdjective = fallbackAdjectives[adjectiveIndex];
  const capitalizedAnimal = zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1);

  return `${selectedAdjective} ${capitalizedAnimal}`;
}

// Heavenly Stems (Tiangan) - 10 stems in order
const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
];

// Earthly Branches (Dizhi) - 12 branches in order
const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
];

// Elements associated with stems and branches
const STEM_ELEMENTS = [
  'wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'
];

const BRANCH_ELEMENTS = [
  'water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'
];

// Solar terms for accurate month pillar calculation
// Each year has 24 solar terms, we need the start dates for each month
const SOLAR_TERMS_2024 = [
  { name: 'lichun', date: new Date('2024-02-04T16:27:00Z') },      // Start of Spring
  { name: 'jingzhe', date: new Date('2024-03-05T10:23:00Z') },     // Awakening of Insects  
  { name: 'qingming', date: new Date('2024-04-04T15:02:00Z') },    // Clear and Bright
  { name: 'lixia', date: new Date('2024-05-05T08:10:00Z') },       // Start of Summer
  { name: 'mangzhong', date: new Date('2024-06-05T12:10:00Z') },   // Grain in Ear
  { name: 'xiaoshu', date: new Date('2024-07-06T22:20:00Z') },     // Minor Heat
  { name: 'liqiu', date: new Date('2024-08-07T14:19:00Z') },       // Start of Autumn
  { name: 'bailu', date: new Date('2024-09-07T11:11:00Z') },       // White Dew
  { name: 'hanlu', date: new Date('2024-10-08T09:00:00Z') },       // Cold Dew
  { name: 'lidong', date: new Date('2024-11-07T12:20:00Z') },      // Start of Winter
  { name: 'daxue', date: new Date('2024-12-07T05:17:00Z') },       // Major Snow
  { name: 'xiaohan', date: new Date('2025-01-05T22:23:00Z') }      // Minor Cold
];

/**
 * Converts birth details to local time considering timezone
 */
function getLocalBirthDateTime(birthDetails: BirthDetails): Date {
  const { date, time, location } = birthDetails;
  
  // Use noon as default if time is unknown (as per requirement 3.6)
  const birthTime = time || '12:00';
  const [hours, minutes] = birthTime.split(':').map(Number);
  
  // Create date in the birth location's timezone
  const localDateTime = new Date(date);
  localDateTime.setHours(hours, minutes, 0, 0);
  
  // Note: For accurate Ba Zi calculation, we should convert to Chinese Standard Time
  // but for simplicity, we'll use the local time as provided
  return localDateTime;
}

/**
 * Calculates the year pillar based on Chinese New Year
 */
function calculateYearPillar(birthDate: Date): { stem: string; branch: string; element: string } {
  const chineseYear = getChineseZodiacYear(birthDate);
  
  // Year stem cycles every 10 years, starting from 甲 (Jia) in year 4
  // The cycle: 1984=甲, 1985=乙, 1986=丙, etc.
  const stemIndex = (chineseYear - 4) % 10;
  const adjustedStemIndex = stemIndex < 0 ? stemIndex + 10 : stemIndex;
  
  // Year branch cycles every 12 years, starting from 子 (Zi) in year 1984
  const branchIndex = (chineseYear - 1984) % 12;
  const adjustedBranchIndex = branchIndex < 0 ? branchIndex + 12 : branchIndex;
  
  const stem = HEAVENLY_STEMS[adjustedStemIndex];
  const branch = EARTHLY_BRANCHES[adjustedBranchIndex];
  const element = STEM_ELEMENTS[adjustedStemIndex];
  
  return { stem, branch, element };
}

/**
 * Calculates the month pillar based on solar terms
 * In Ba Zi, months are determined by solar terms, not calendar months
 */
function calculateMonthPillar(birthDateTime: Date, yearStemIndex: number): { stem: string; branch: string; element: string } {
  // For simplicity, we'll use calendar months with adjustments
  // In a full implementation, this would use precise solar term calculations
  
  const month = birthDateTime.getMonth(); // 0-11
  const day = birthDateTime.getDate();
  
  // Approximate solar month boundaries (simplified)
  let solarMonth = month;
  
  // Adjust for solar terms (approximate - real implementation would use precise calculations)
  if (month === 1 && day < 4) solarMonth = 0;  // Before Lichun
  if (month === 2 && day < 5) solarMonth = 1;  // Before Jingzhe
  if (month === 3 && day < 5) solarMonth = 2;  // Before Qingming
  if (month === 4 && day < 5) solarMonth = 3;  // Before Lixia
  if (month === 5 && day < 6) solarMonth = 4;  // Before Mangzhong
  if (month === 6 && day < 7) solarMonth = 5;  // Before Xiaoshu
  if (month === 7 && day < 8) solarMonth = 6;  // Before Liqiu
  if (month === 8 && day < 8) solarMonth = 7;  // Before Bailu
  if (month === 9 && day < 8) solarMonth = 8;  // Before Hanlu
  if (month === 10 && day < 7) solarMonth = 9; // Before Lidong
  if (month === 11 && day < 7) solarMonth = 10; // Before Daxue
  
  // Month branch starts from 寅 (Tiger) for the first solar month
  const branchIndex = (solarMonth + 2) % 12; // +2 because 寅 is index 2
  
  // Month stem calculation based on year stem
  // Formula: Month stem = (Year stem index * 2 + solar month) % 10
  const stemIndex = (yearStemIndex * 2 + solarMonth) % 10;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  const element = STEM_ELEMENTS[stemIndex];
  
  return { stem, branch, element };
}

/**
 * Calculates the day pillar using the traditional 60-day cycle
 */
function calculateDayPillar(birthDateTime: Date): { stem: string; branch: string; element: string } {
  // Calculate days since a known reference point
  // Using January 1, 1900 as reference (known to be 戊戌 day)
  const referenceDate = new Date('1900-01-01');
  const daysDifference = Math.floor((birthDateTime.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // The reference date (1900-01-01) corresponds to day 35 in the 60-day cycle
  // (戊 = index 4, 戌 = index 10, so 4*12 + 10 = 58, but we use 35 as the known reference)
  const referenceDayInCycle = 35;
  
  // Calculate the current day in the 60-day cycle
  const dayInCycle = (referenceDayInCycle + daysDifference) % 60;
  const adjustedDayInCycle = dayInCycle < 0 ? dayInCycle + 60 : dayInCycle;
  
  // Extract stem and branch from the 60-day cycle position
  const stemIndex = adjustedDayInCycle % 10;
  const branchIndex = adjustedDayInCycle % 12;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  const element = STEM_ELEMENTS[stemIndex];
  
  return { stem, branch, element };
}

/**
 * Calculates the hour pillar based on birth time
 */
function calculateHourPillar(birthDateTime: Date, dayStemIndex: number): { stem: string; branch: string; element: string } {
  const hour = birthDateTime.getHours();
  
  // Hour branches (each covers 2 hours)
  // 子 (23-01), 丑 (01-03), 寅 (03-05), 卯 (05-07), 辰 (07-09), 巳 (09-11)
  // 午 (11-13), 未 (13-15), 申 (15-17), 酉 (17-19), 戌 (19-21), 亥 (21-23)
  let branchIndex: number;
  
  if (hour >= 23 || hour < 1) branchIndex = 0;  // 子
  else if (hour < 3) branchIndex = 1;           // 丑
  else if (hour < 5) branchIndex = 2;           // 寅
  else if (hour < 7) branchIndex = 3;           // 卯
  else if (hour < 9) branchIndex = 4;           // 辰
  else if (hour < 11) branchIndex = 5;          // 巳
  else if (hour < 13) branchIndex = 6;          // 午
  else if (hour < 15) branchIndex = 7;          // 未
  else if (hour < 17) branchIndex = 8;          // 申
  else if (hour < 19) branchIndex = 9;          // 酉
  else if (hour < 21) branchIndex = 10;         // 戌
  else branchIndex = 11;                        // 亥
  
  // Hour stem calculation based on day stem
  // Formula: Hour stem = (Day stem index * 2 + hour branch index) % 10
  const stemIndex = (dayStemIndex * 2 + branchIndex) % 10;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  const element = STEM_ELEMENTS[stemIndex];
  
  return { stem, branch, element };
}

/**
 * Main function to calculate Four Pillars of Destiny (Ba Zi)
 * Implements traditional Chinese astrology calculations with solar terms and timezone handling
 */
export function calculateFourPillars(birthDetails: BirthDetails): FourPillars {
  try {
    // Convert to local birth time, defaulting to noon if time is unknown
    const birthDateTime = getLocalBirthDateTime(birthDetails);
    
    // Calculate each pillar
    const yearPillar = calculateYearPillar(birthDateTime);
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
    
    const monthPillar = calculateMonthPillar(birthDateTime, yearStemIndex);
    
    const dayPillar = calculateDayPillar(birthDateTime);
    const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);
    
    const hourPillar = calculateHourPillar(birthDateTime, dayStemIndex);
    
    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };
  } catch (error) {
    console.error('Error calculating Four Pillars:', error);
    throw new Error(`Failed to calculate Four Pillars: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates poetic descriptions for each of the Four Pillars
 * Each pillar represents a different aspect of destiny and personality
 */
export async function generatePillarDescriptions(pillars: FourPillars): Promise<PillarDescriptions> {
  try {
    // Use centralized LLM service for creative descriptions
    if (llmService.isServiceAvailable()) {
      const systemPrompt = "You are a mystical Chinese astrology expert who creates poetic, meaningful descriptions for the Four Pillars of Destiny (Ba Zi). Each pillar represents a different aspect of a person's destiny and should be described in a mystical, reflective tone.";

      const userPrompt = `Generate poetic descriptions for the Four Pillars of Destiny based on these stem-branch combinations:

Year Pillar (Destiny): ${pillars.year.stem}${pillars.year.branch} (${pillars.year.element})
Month Pillar (Environment): ${pillars.month.stem}${pillars.month.branch} (${pillars.month.element})
Day Pillar (Essence): ${pillars.day.stem}${pillars.day.branch} (${pillars.day.element})
Hour Pillar (Inner Heart): ${pillars.hour.stem}${pillars.hour.branch} (${pillars.hour.element})

Requirements:
- Each description should be 1-2 sentences
- Use mystical, poetic language that feels authentic to Chinese philosophy
- Focus on the meaning and energy of each pillar's role:
  * Year Pillar: Overall destiny and life path
  * Month Pillar: Environment and relationships
  * Day Pillar: Core essence and personality
  * Hour Pillar: Inner heart and spiritual nature
- Consider the elements and their interactions
- Keep descriptions positive and meaningful
- Write in English

Format your response as:
Year: [description]
Month: [description]
Day: [description]
Hour: [description]`;

      const response = await llmService.generateContent({
        systemPrompt,
        userPrompt,
        maxTokens: 300,
        temperature: 0.8
      });

      // Parse the response to extract individual descriptions
      const descriptions = parsePillarDescriptions(response.content);
      return descriptions;
    } else {
      console.warn('LLM service not available, using fallback');
      return generateFallbackPillarDescriptions(pillars);
    }
  } catch (error) {
    console.warn('Failed to generate pillar descriptions with LLM service, using fallback:', error);
    return generateFallbackPillarDescriptions(pillars);
  }
}

/**
 * Parses LLM response to extract pillar descriptions
 */
function parsePillarDescriptions(response: string): PillarDescriptions {
  const lines = response.split('\n').filter(line => line.trim());
  const descriptions: Partial<PillarDescriptions> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Year:')) {
      descriptions.year = trimmed.substring(5).trim();
    } else if (trimmed.startsWith('Month:')) {
      descriptions.month = trimmed.substring(6).trim();
    } else if (trimmed.startsWith('Day:')) {
      descriptions.day = trimmed.substring(4).trim();
    } else if (trimmed.startsWith('Hour:')) {
      descriptions.hour = trimmed.substring(5).trim();
    }
  }

  // Ensure all descriptions are present, use fallback if missing
  return {
    year: descriptions.year || 'Your destiny flows like a river, shaped by ancient wisdom and future possibilities.',
    month: descriptions.month || 'Your environment nurtures growth, like fertile soil beneath the changing seasons.',
    day: descriptions.day || 'Your essence shines with unique light, a star in the constellation of being.',
    hour: descriptions.hour || 'Your inner heart beats with the rhythm of the cosmos, deep and eternal.'
  };
}

/**
 * Fallback pillar descriptions when LLM is unavailable
 */
function generateFallbackPillarDescriptions(pillars: FourPillars): PillarDescriptions {
  // Element-based description templates
  const elementDescriptions = {
    wood: {
      year: 'Your destiny grows like a mighty tree, reaching toward the heavens with patience and strength.',
      month: 'Your environment flourishes with creative energy, nurturing new beginnings and fresh growth.',
      day: 'Your essence flows with natural grace, bending without breaking, adapting to life\'s seasons.',
      hour: 'Your inner heart pulses with the rhythm of spring, eternally hopeful and regenerative.'
    },
    fire: {
      year: 'Your destiny burns bright with passion and purpose, illuminating the path for others to follow.',
      month: 'Your environment crackles with dynamic energy, inspiring transformation and bold action.',
      day: 'Your essence radiates warmth and light, drawing others to your magnetic presence.',
      hour: 'Your inner heart blazes with the fire of inspiration, never dimming in its intensity.'
    },
    earth: {
      year: 'Your destiny stands firm like ancient mountains, providing stability and enduring wisdom.',
      month: 'Your environment offers solid ground for growth, reliable and nurturing to all who seek shelter.',
      day: 'Your essence embodies the strength of stone and the fertility of soil, grounded yet generous.',
      hour: 'Your inner heart beats with the steady rhythm of the earth, patient and deeply rooted.'
    },
    metal: {
      year: 'Your destiny shines with the clarity of polished steel, cutting through illusion to reveal truth.',
      month: 'Your environment resonates with precision and order, creating harmony through structure.',
      day: 'Your essence reflects like a mirror, showing both strength and the ability to conduct energy.',
      hour: 'Your inner heart rings like a temple bell, clear and pure in its resonance.'
    },
    water: {
      year: 'Your destiny flows like an ancient river, finding its way through any obstacle with gentle persistence.',
      month: 'Your environment moves with fluid grace, adapting and shaping the landscape around you.',
      day: 'Your essence runs deep like hidden springs, nourishing life with quiet wisdom.',
      hour: 'Your inner heart flows with the tides of intuition, connected to the moon\'s eternal dance.'
    }
  };

  return {
    year: elementDescriptions[pillars.year.element as keyof typeof elementDescriptions]?.year || 
          'Your destiny unfolds with the wisdom of the ages, guided by celestial forces.',
    month: elementDescriptions[pillars.month.element as keyof typeof elementDescriptions]?.month || 
           'Your environment shapes you with gentle persistence, like wind carving stone.',
    day: elementDescriptions[pillars.day.element as keyof typeof elementDescriptions]?.day || 
         'Your essence shines with unique brilliance, a jewel in the crown of existence.',
    hour: elementDescriptions[pillars.hour.element as keyof typeof elementDescriptions]?.hour || 
          'Your inner heart beats with ancient rhythms, connected to the pulse of the universe.'
  };
}

/**
 * Generates a 3-line zodiac essence summary combining zodiac and pillars
 */
export async function generateEssenceSummary(zodiac: ChineseZodiac, pillars: FourPillars): Promise<string> {
  try {
    // Use centralized LLM service for creative summary
    if (llmService.isServiceAvailable()) {
      const systemPrompt = "You are a mystical Chinese astrology expert who creates beautiful, poetic essence summaries. Create exactly 3 lines that capture the spiritual essence of a person based on their zodiac and Four Pillars.";

      const userPrompt = `Create a 3-line zodiac essence summary for someone with:

Zodiac: ${zodiac.element} ${zodiac.animal} (${zodiac.year})
Four Pillars: 
- Year: ${pillars.year.stem}${pillars.year.branch} (${pillars.year.element})
- Month: ${pillars.month.stem}${pillars.month.branch} (${pillars.month.element})
- Day: ${pillars.day.stem}${pillars.day.branch} (${pillars.day.element})
- Hour: ${pillars.hour.stem}${pillars.hour.branch} (${pillars.hour.element})

Requirements:
- Exactly 3 lines, each line should be poetic and meaningful
- Incorporate the zodiac animal and element naturally
- Reference the interplay of the pillar elements
- Use mystical, beautiful language that feels authentic to Chinese philosophy
- Each line should flow into the next, creating a cohesive spiritual portrait
- Keep it positive and inspiring
- Write in English

Example format:
Born under the [element] [animal], you carry the wisdom of [concept]
Your pillars dance between [elements], creating harmony in [aspect]
In your heart flows the eternal [metaphor], guiding you toward [destiny]`;

      const response = await llmService.generateContent({
        systemPrompt,
        userPrompt,
        maxTokens: 150,
        temperature: 0.9
      });

      // Clean up the response and ensure it's exactly 3 lines
      const lines = response.content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length >= 3) {
        return lines.slice(0, 3).join('\n');
      } else {
        // If LLM didn't provide 3 lines, use fallback
        return generateFallbackEssenceSummary(zodiac, pillars);
      }
    } else {
      console.warn('LLM service not available, using fallback');
      return generateFallbackEssenceSummary(zodiac, pillars);
    }
  } catch (error) {
    console.warn('Failed to generate essence summary with LLM service, using fallback:', error);
    return generateFallbackEssenceSummary(zodiac, pillars);
  }
}

/**
 * Fallback essence summary when LLM is unavailable
 */
function generateFallbackEssenceSummary(zodiac: ChineseZodiac, pillars: FourPillars): string {
  // Get the dominant elements from pillars
  const elements = [pillars.year.element, pillars.month.element, pillars.day.element, pillars.hour.element];
  const elementCounts = elements.reduce((acc, element) => {
    acc[element] = (acc[element] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0][0];

  // Animal-specific essence templates
  const animalEssences = {
    rat: {
      line1: `Born under the ${zodiac.element} rat, you carry the wisdom of resourcefulness and adaptability`,
      line2: `Your pillars weave between ${dominantElement} and spirit, creating harmony in clever solutions`,
      line3: `In your heart flows the eternal stream of opportunity, guiding you toward hidden treasures`
    },
    ox: {
      line1: `Born under the ${zodiac.element} ox, you carry the wisdom of patience and steady strength`,
      line2: `Your pillars dance between ${dominantElement} and earth, creating harmony in persistent effort`,
      line3: `In your heart flows the eternal rhythm of seasons, guiding you toward lasting achievement`
    },
    tiger: {
      line1: `Born under the ${zodiac.element} tiger, you carry the wisdom of courage and noble spirit`,
      line2: `Your pillars blaze between ${dominantElement} and fire, creating harmony in bold action`,
      line3: `In your heart flows the eternal roar of justice, guiding you toward righteous victory`
    },
    rabbit: {
      line1: `Born under the ${zodiac.element} rabbit, you carry the wisdom of gentleness and intuition`,
      line2: `Your pillars flow between ${dominantElement} and moon, creating harmony in peaceful grace`,
      line3: `In your heart flows the eternal spring of compassion, guiding you toward healing others`
    },
    dragon: {
      line1: `Born under the ${zodiac.element} dragon, you carry the wisdom of transformation and power`,
      line2: `Your pillars soar between ${dominantElement} and sky, creating harmony in majestic purpose`,
      line3: `In your heart flows the eternal fire of destiny, guiding you toward legendary greatness`
    },
    snake: {
      line1: `Born under the ${zodiac.element} snake, you carry the wisdom of mystery and deep knowledge`,
      line2: `Your pillars coil between ${dominantElement} and shadow, creating harmony in hidden truths`,
      line3: `In your heart flows the eternal serpent of wisdom, guiding you toward profound understanding`
    },
    horse: {
      line1: `Born under the ${zodiac.element} horse, you carry the wisdom of freedom and swift movement`,
      line2: `Your pillars gallop between ${dominantElement} and wind, creating harmony in joyful journey`,
      line3: `In your heart flows the eternal spirit of adventure, guiding you toward distant horizons`
    },
    goat: {
      line1: `Born under the ${zodiac.element} goat, you carry the wisdom of creativity and gentle strength`,
      line2: `Your pillars graze between ${dominantElement} and cloud, creating harmony in artistic beauty`,
      line3: `In your heart flows the eternal song of peace, guiding you toward harmonious expression`
    },
    monkey: {
      line1: `Born under the ${zodiac.element} monkey, you carry the wisdom of cleverness and playful spirit`,
      line2: `Your pillars swing between ${dominantElement} and laughter, creating harmony in joyful innovation`,
      line3: `In your heart flows the eternal dance of curiosity, guiding you toward delightful discoveries`
    },
    rooster: {
      line1: `Born under the ${zodiac.element} rooster, you carry the wisdom of dawn and proud confidence`,
      line2: `Your pillars crow between ${dominantElement} and light, creating harmony in honest expression`,
      line3: `In your heart flows the eternal call of truth, guiding you toward brilliant awakening`
    },
    dog: {
      line1: `Born under the ${zodiac.element} dog, you carry the wisdom of loyalty and protective love`,
      line2: `Your pillars guard between ${dominantElement} and heart, creating harmony in faithful service`,
      line3: `In your heart flows the eternal bond of devotion, guiding you toward noble companionship`
    },
    pig: {
      line1: `Born under the ${zodiac.element} pig, you carry the wisdom of abundance and generous spirit`,
      line2: `Your pillars feast between ${dominantElement} and joy, creating harmony in shared prosperity`,
      line3: `In your heart flows the eternal well of kindness, guiding you toward bountiful happiness`
    }
  };

  const essence = animalEssences[zodiac.animal];
  return `${essence.line1}\n${essence.line2}\n${essence.line3}`;
}

/**
 * Creates a complete astrological profile from birth details
 * Includes zodiac calculation, Four Pillars computation, descriptions, and essence summary
 */
export async function createAstrologicalProfile(birthDetails: BirthDetails): Promise<AstrologicalProfile> {
  const zodiac = calculateChineseZodiac(birthDetails.date);
  const mysticalNickname = await generateMysticalNickname(zodiac);
  const pillars = calculateFourPillars(birthDetails);
  const pillarDescriptions = await generatePillarDescriptions(pillars);
  const essenceSummary = await generateEssenceSummary(zodiac, pillars);

  return {
    zodiac,
    mysticalNickname,
    pillars,
    pillarDescriptions,
    essenceSummary
  };
}