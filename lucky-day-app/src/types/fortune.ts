/**
 * Fortune-related type definitions for Lucky Day app
 * Defines interfaces for fortune messages and decorative elements
 */

export interface DecorativeElements {
  /** Chinese ideogram for decoration */
  ideogram: string;
  /** Calligraphic signature */
  signature: string;
}

export interface Fortune {
  /** Unique fortune identifier */
  id: string;
  /** Fortune message (max 200 characters) */
  message: string;
  /** When the fortune was generated */
  generatedAt: Date;
  /** When the fortune expires (always 8am the next day, regardless of generation time) */
  expiresAt: Date;
  /** Source of the fortune */
  source: 'ai' | 'fallback';
  /** Decorative elements for display */
  decorativeElements: DecorativeElements;
}

export type FortuneSource = Fortune['source'];

/**
 * Calculates the expiration date for a fortune (8am the next day)
 * @param generatedAt The date when the fortune was generated
 * @returns Date object set to 8am the next day
 */
export function calculateFortuneExpiration(generatedAt: Date): Date {
  const nextDay = new Date(generatedAt);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(8, 0, 0, 0); // Set to 8:00:00.000 AM
  return nextDay;
}