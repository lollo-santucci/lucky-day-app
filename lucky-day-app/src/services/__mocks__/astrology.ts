/**
 * Mock implementation of astrology service for testing
 */

import { BirthDetails, ChineseZodiac, FourPillars, PillarDescriptions } from '../../types/astrology';

export const calculateChineseZodiac = jest.fn();
export const calculateFourPillars = jest.fn();
export const generateMysticalNickname = jest.fn();
export const generatePillarDescriptions = jest.fn();
export const generateEssenceSummary = jest.fn();