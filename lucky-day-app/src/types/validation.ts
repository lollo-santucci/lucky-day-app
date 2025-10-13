/**
 * Validation schemas and functions for data integrity
 * Provides runtime validation for all data models
 */

import { BirthDetails, ChineseZodiac, FourPillars, AstrologicalProfile } from './astrology';
import { Fortune } from './fortune';
import { AppState, AppSettings, AppAnalytics } from './app';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates birth details input
 */
export function validateBirthDetails(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Birth details must be an object'] };
    }

    // Validate date
    if (!data.date || !(data.date instanceof Date) || isNaN(data.date.getTime())) {
        errors.push('Valid birth date is required');
    }

    // Validate time (optional)
    if (data.time !== null && data.time !== undefined) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (typeof data.time !== 'string' || !timeRegex.test(data.time)) {
            errors.push('Birth time must be in HH:MM format or null');
        }
    }

    // Validate location
    if (!data.location || typeof data.location !== 'object') {
        errors.push('Birth location is required');
    } else {
        if (typeof data.location.latitude !== 'number' ||
            data.location.latitude < -90 || data.location.latitude > 90) {
            errors.push('Valid latitude (-90 to 90) is required');
        }
        if (typeof data.location.longitude !== 'number' ||
            data.location.longitude < -180 || data.location.longitude > 180) {
            errors.push('Valid longitude (-180 to 180) is required');
        }
        if (typeof data.location.timezone !== 'string' || data.location.timezone.length === 0) {
            errors.push('Valid timezone string is required');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates Chinese zodiac data
 */
export function validateChineseZodiac(data: any): ValidationResult {
    const errors: string[] = [];
    const validAnimals = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
        'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
    const validElements = ['wood', 'fire', 'earth', 'metal', 'water'];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Chinese zodiac must be an object'] };
    }

    if (!validAnimals.includes(data.animal)) {
        errors.push(`Animal must be one of: ${validAnimals.join(', ')}`);
    }

    if (!validElements.includes(data.element)) {
        errors.push(`Element must be one of: ${validElements.join(', ')}`);
    }

    if (typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
        errors.push('Year must be a number between 1900 and 2100');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates Four Pillars data
 */
export function validateFourPillars(data: any): ValidationResult {
    const errors: string[] = [];
    const pillars = ['year', 'month', 'day', 'hour'];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Four Pillars must be an object'] };
    }

    for (const pillar of pillars) {
        if (!data[pillar] || typeof data[pillar] !== 'object') {
            errors.push(`${pillar} pillar is required and must be an object`);
            continue;
        }

        const pillarData = data[pillar];
        if (typeof pillarData.stem !== 'string' || pillarData.stem.length === 0) {
            errors.push(`${pillar} pillar stem must be a non-empty string`);
        }
        if (typeof pillarData.branch !== 'string' || pillarData.branch.length === 0) {
            errors.push(`${pillar} pillar branch must be a non-empty string`);
        }
        if (typeof pillarData.element !== 'string' || pillarData.element.length === 0) {
            errors.push(`${pillar} pillar element must be a non-empty string`);
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates fortune data
 */
export function validateFortune(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['Fortune must be an object'] };
    }

    if (typeof data.id !== 'string' || data.id.length === 0) {
        errors.push('Fortune ID must be a non-empty string');
    }

    if (typeof data.message !== 'string' || data.message.length === 0) {
        errors.push('Fortune message must be a non-empty string');
    } else if (data.message.length > 200) {
        errors.push('Fortune message must be 200 characters or less');
    }

    if (!data.generatedAt || !(data.generatedAt instanceof Date) || isNaN(data.generatedAt.getTime())) {
        errors.push('Valid generatedAt date is required');
    }

    if (!data.expiresAt || !(data.expiresAt instanceof Date) || isNaN(data.expiresAt.getTime())) {
        errors.push('Valid expiresAt date is required');
    } else if (data.generatedAt && data.generatedAt instanceof Date) {
        // Verify that expiration is set to 8am UTC the next day
        const expectedExpiration = new Date(data.generatedAt);
        expectedExpiration.setUTCDate(expectedExpiration.getUTCDate() + 1);
        expectedExpiration.setUTCHours(8, 0, 0, 0);
        
        if (data.expiresAt.getTime() !== expectedExpiration.getTime()) {
            errors.push('Fortune must expire at 8am UTC the next day after generation');
        }
    }

    if (!['ai', 'fallback'].includes(data.source)) {
        errors.push('Source must be either "ai" or "fallback"');
    }

    if (!data.decorativeElements || typeof data.decorativeElements !== 'object') {
        errors.push('Decorative elements are required');
    } else {
        if (typeof data.decorativeElements.ideogram !== 'string') {
            errors.push('Decorative ideogram must be a string');
        }
        if (typeof data.decorativeElements.signature !== 'string') {
            errors.push('Decorative signature must be a string');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates app state data
 */
export function validateAppState(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
        return { isValid: false, errors: ['App state must be an object'] };
    }

    // Profile is optional (null allowed)
    if (data.profile !== null && data.profile !== undefined) {
        // Basic profile validation - full validation would use validateAstrologicalProfile
        if (typeof data.profile !== 'object') {
            errors.push('Profile must be an object or null');
        }
    }

    // Current fortune is optional (null allowed)
    if (data.currentFortune !== null && data.currentFortune !== undefined) {
        const fortuneValidation = validateFortune(data.currentFortune);
        if (!fortuneValidation.isValid) {
            errors.push(...fortuneValidation.errors.map(err => `Current fortune: ${err}`));
        }
    }

    // Last fortune date is optional (null allowed)
    if (data.lastFortuneDate !== null && data.lastFortuneDate !== undefined) {
        if (!(data.lastFortuneDate instanceof Date) || isNaN(data.lastFortuneDate.getTime())) {
            errors.push('Last fortune date must be a valid Date or null');
        }
    }

    // Settings validation
    if (!data.settings || typeof data.settings !== 'object') {
        errors.push('Settings are required');
    } else {
        if (typeof data.settings.notificationsEnabled !== 'boolean') {
            errors.push('notificationsEnabled must be a boolean');
        }
        if (typeof data.settings.soundEnabled !== 'boolean') {
            errors.push('soundEnabled must be a boolean');
        }
        if (typeof data.settings.iCloudSyncEnabled !== 'boolean') {
            errors.push('iCloudSyncEnabled must be a boolean');
        }
    }

    // Analytics validation
    if (!data.analytics || typeof data.analytics !== 'object') {
        errors.push('Analytics are required');
    } else {
        if (typeof data.analytics.fortunesGenerated !== 'number' || data.analytics.fortunesGenerated < 0) {
            errors.push('fortunesGenerated must be a non-negative number');
        }
        if (typeof data.analytics.appOpens !== 'number' || data.analytics.appOpens < 0) {
            errors.push('appOpens must be a non-negative number');
        }
        if (!(data.analytics.lastActiveDate instanceof Date) || isNaN(data.analytics.lastActiveDate.getTime())) {
            errors.push('lastActiveDate must be a valid Date');
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Type guard functions for runtime type checking
 */
export function isBirthDetails(data: any): data is BirthDetails {
    return validateBirthDetails(data).isValid;
}

export function isChineseZodiac(data: any): data is ChineseZodiac {
    return validateChineseZodiac(data).isValid;
}

export function isFourPillars(data: any): data is FourPillars {
    return validateFourPillars(data).isValid;
}

export function isFortune(data: any): data is Fortune {
    return validateFortune(data).isValid;
}

export function isAppState(data: any): data is AppState {
    return validateAppState(data).isValid;
}