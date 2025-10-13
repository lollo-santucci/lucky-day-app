/**
 * Test setup file for Lucky Day app
 * Configures global test environment and mocks
 */

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
  digestStringAsync: jest.fn(),
}));

// Global test utilities
(global as any).mockAsyncStorage = mockAsyncStorage;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});