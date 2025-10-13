/**
 * Astrology-related type definitions for Lucky Day app
 * Defines interfaces for birth details, Chinese zodiac, Four Pillars, and astrological profiles
 */

export interface BirthDetails {
  /** Birth date */
  date: Date;
  /** Birth time in HH:MM format, null if unknown */
  time: string | null;
  /** Birth location details */
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface ChineseZodiac {
  /** Chinese zodiac animal */
  animal: 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 
          'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';
  /** Associated element */
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  /** Birth year */
  year: number;
}

export interface PillarData {
  /** Heavenly stem */
  stem: string;
  /** Earthly branch */
  branch: string;
  /** Associated element */
  element: string;
}

export interface FourPillars {
  /** Year pillar - represents destiny */
  year: PillarData;
  /** Month pillar - represents environment */
  month: PillarData;
  /** Day pillar - represents essence */
  day: PillarData;
  /** Hour pillar - represents inner heart */
  hour: PillarData;
}

export interface PillarDescriptions {
  /** Year pillar description (Destiny) */
  year: string;
  /** Month pillar description (Environment) */
  month: string;
  /** Day pillar description (Essence) */
  day: string;
  /** Hour pillar description (Inner Heart) */
  hour: string;
}

export interface AstrologicalProfile {
  /** Chinese zodiac information */
  zodiac: ChineseZodiac;
  /** Four Pillars of Destiny */
  pillars: FourPillars;
  /** Generated mystical nickname */
  mysticalNickname: string;
  /** Poetic descriptions for each pillar */
  pillarDescriptions: PillarDescriptions;
  /** 3-line zodiac essence summary */
  essenceSummary: string;
}