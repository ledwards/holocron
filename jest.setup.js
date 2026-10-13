// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock dependencies that might cause issues in tests
jest.mock(
  'react-native-reanimated',
  () => {
    try {
      const Reanimated = require('react-native-reanimated/mock');
      Reanimated.default.call = () => {};
      return Reanimated;
    } catch {
      return {
        default: {
          call: () => {},
        },
        createAnimatedComponent: (Component) => Component,
      };
    }
  },
  {virtual: true},
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock BlurView
jest.mock('@react-native-community/blur', () => ({
  BlurView: 'BlurView',
}));

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const {Image} = require('react-native');
  const FastImage = props => React.createElement(Image, props);
  FastImage.resizeMode = {contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center'};
  return {__esModule: true, default: FastImage};
});

jest.mock('react-native-device-info', () => ({
  hasNotch: () => false,
}));

// Setup to silence specific expected warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific warning messages
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning: ReactDOM.render') || 
     args[0].includes('Warning: React.createElement') ||
     args[0].includes('Warning: Each child in a list should have a unique'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Set up basic mocks for dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => ({
      width: 375,
      height: 812,
    })),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    removeEventListener: jest.fn(),
  },
  get: jest.fn(() => ({
    width: 375,
    height: 812,
  })),
  addEventListener: jest.fn(() => ({remove: jest.fn()})),
  removeEventListener: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => 2),
    roundToNearestPixel: jest.fn((value) => value),
  },
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn((value) => value),
}));

// Make sure that any unhandled promise rejections fail tests
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
