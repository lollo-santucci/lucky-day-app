/**
 * Mock for expo-font module
 */

const Font = {
  loadAsync: jest.fn().mockResolvedValue(undefined),
  isLoaded: jest.fn().mockReturnValue(true),
};

module.exports = {
  Font,
  loadAsync: Font.loadAsync,
  isLoaded: Font.isLoaded,
  default: Font,
};