/**
 * Mock for React Native components in tests
 */

const mockComponent = (name) => {
  const Component = (props) => {
    return {
      type: name,
      props,
    };
  };
  Component.displayName = name;
  return Component;
};

const mockAnimatedValue = () => ({
  setValue: jest.fn(),
  interpolate: jest.fn(() => mockAnimatedValue()),
});

module.exports = {
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  Animated: {
    Value: jest.fn(() => mockAnimatedValue()),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    View: mockComponent('Animated.View'),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
};