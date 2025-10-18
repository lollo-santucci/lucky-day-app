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
  source: 'ai' | 'connectivity_error';
  /** Decorative elements for display */
  decorativeElements: DecorativeElements;
}

export type FortuneSource = Fortune['source'];

/**
 * Calculates the expiration date for a fortune (8am local time the next day)
 * @param generatedAt The date when the fortune was generated
 * @returns Date object set to 8am local time the next day
 */
export function calculateFortuneExpiration(generatedAt: Date): Date {
  const nextDay = new Date(generatedAt);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(8, 0, 0, 0); // Set to 8:00:00.000 AM local time
  return nextDay;
}

/**
 * Calculates the next 8am local time from the current date
 * If it's already past 8am today, returns 8am tomorrow
 * If it's before 8am today, returns 8am today
 * @param currentDate The current date/time
 * @returns Date object set to the next 8am local time
 */
export function getNext8amLocalTime(currentDate: Date = new Date()): Date {
  const next8am = new Date(currentDate);
  next8am.setHours(8, 0, 0, 0); // Set to 8:00:00.000 AM local time
  
  // If it's already past 8am today, move to 8am tomorrow
  if (currentDate.getHours() >= 8) {
    next8am.setDate(next8am.getDate() + 1);
  }
  
  return next8am;
}

/**
 * Check if current time is within the daily fortune window (8am to next 8am)
 * @param currentDate The current date/time (defaults to now)
 * @param lastFortuneDate The date when the last fortune was generated
 * @returns true if a new fortune can be generated
 */
export function canGenerateFortuneToday(currentDate: Date = new Date(), lastFortuneDate: Date | null = null): boolean {
  // If no previous fortune, can always generate
  if (!lastFortuneDate) {
    return true;
  }
  
  // Get today's 8am and tomorrow's 8am in local time
  const today8am = new Date(currentDate);
  today8am.setHours(8, 0, 0, 0);
  
  const tomorrow8am = new Date(today8am);
  tomorrow8am.setDate(tomorrow8am.getDate() + 1);
  
  // Get the 8am of the day when last fortune was generated
  const lastFortune8am = new Date(lastFortuneDate);
  lastFortune8am.setHours(8, 0, 0, 0);
  
  // If last fortune was generated before today's 8am, can generate new one
  return lastFortuneDate < today8am;
}