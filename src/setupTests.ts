/**
 * Test setup file for Lucky Day app
 * Configures global test environment and mocks
 */

// Import jest-native matchers
import '@testing-library/jest-native/extend-expect';

// Polyfill fetch for OpenAI client in test environment
global.fetch = require('whatwg-fetch').fetch;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('./__mocks__/asyncStorage.js'));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
  digestStringAsync: jest.fn(),
}));

// Global test utilities
(global as any).mockAsyncStorage = require('./__mocks__/asyncStorage.js');

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});