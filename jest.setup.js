// jest.setup.js
/* eslint-env jest, node */
import 'react-native-gesture-handler/jestSetup';
import {format} from 'util';

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

// React list-key warnings FAIL the test that caused them. They used to be
// silenced here, and duplicate keys are exactly how the 2026-10-27 card
// search bug showed up: upstream reused gempIds, the card list keyed rows by
// them, and rows repeated or stayed behind from an earlier search.
const KEY_WARNINGS = [
  'Each child in a list should have a unique',
  'Encountered two children with the same key',
];
const keyWarnings = [];
global.__keyWarnings = keyWarnings;

console.error = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (KEY_WARNINGS.some(w => message.includes(w))) {
    keyWarnings.push(format(...args).split('\n').slice(0, 4).join('\n'));
    return;
  }
  // Filter out specific warning messages
  if (
    message.includes('Warning: ReactDOM.render') ||
    message.includes('Warning: React.createElement')
  ) {
    return;
  }
  originalConsoleError(...args);
};

afterEach(() => {
  if (keyWarnings.length) {
    const found = keyWarnings.splice(0);
    throw new Error(`React list-key warning (duplicate or missing key):\n${found.join('\n---\n')}`);
  }
});

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
