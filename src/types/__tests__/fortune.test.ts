/**
 * Unit tests for fortune utility functions
 * Tests fortune expiration calculation and related utilities
 */

import { calculateFortuneExpiration, Fortune } from '../fortune';

describe('calculateFortuneExpiration', () => {
  it('should set expiration to 8am UTC the next day', () => {
    const generatedAt = new Date('2024-01-15T10:30:45.123Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCFullYear()).toBe(2024);
    expect(expiration.getUTCMonth()).toBe(0); // January (0-indexed)
    expect(expiration.getUTCDate()).toBe(16); // Next day
    expect(expiration.getUTCHours()).toBe(8);
    expect(expiration.getUTCMinutes()).toBe(0);
    expect(expiration.getUTCSeconds()).toBe(0);
    expect(expiration.getUTCMilliseconds()).toBe(0);
  });

  it('should handle generation at midnight', () => {
    const generatedAt = new Date('2024-01-15T00:00:00.000Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCDate()).toBe(16);
    expect(expiration.getUTCHours()).toBe(8);
  });

  it('should handle generation late at night', () => {
    const generatedAt = new Date('2024-01-15T23:59:59.999Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCDate()).toBe(16);
    expect(expiration.getUTCHours()).toBe(8);
  });

  it('should handle month boundary', () => {
    const generatedAt = new Date('2024-01-31T15:00:00.000Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCMonth()).toBe(1); // February
    expect(expiration.getUTCDate()).toBe(1);
    expect(expiration.getUTCHours()).toBe(8);
  });

  it('should handle year boundary', () => {
    const generatedAt = new Date('2024-12-31T20:00:00.000Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCFullYear()).toBe(2025);
    expect(expiration.getUTCMonth()).toBe(0); // January
    expect(expiration.getUTCDate()).toBe(1);
    expect(expiration.getUTCHours()).toBe(8);
  });

  it('should handle leap year', () => {
    const generatedAt = new Date('2024-02-28T12:00:00.000Z'); // 2024 is a leap year
    const expiration = calculateFortuneExpiration(generatedAt);
    
    expect(expiration.getUTCDate()).toBe(29); // February 29th exists in 2024
    expect(expiration.getUTCHours()).toBe(8);
  });

  it('should not modify the original date', () => {
    const originalDate = new Date('2024-01-15T10:30:45.123Z');
    const originalTime = originalDate.getTime();
    
    calculateFortuneExpiration(originalDate);
    
    expect(originalDate.getTime()).toBe(originalTime);
  });

  it('should handle different timezones consistently', () => {
    // The function should work with UTC dates regardless of local timezone
    const generatedAt = new Date('2024-01-15T10:30:00.000Z');
    const expiration = calculateFortuneExpiration(generatedAt);
    
    // Should always be 8am UTC the next day
    expect(expiration.toISOString()).toBe('2024-01-16T08:00:00.000Z');
  });
});