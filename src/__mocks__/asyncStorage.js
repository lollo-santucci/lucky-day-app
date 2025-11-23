// Mock implementation of AsyncStorage for testing
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
};

module.exports = mockAsyncStorage;