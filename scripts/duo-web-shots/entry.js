// Screenshot harness entry. run.sh copies it into a temporary copy of the
// repo as shots/entry.js; it is never part of the app's own bundle.
import 'react-native-gesture-handler';
import {NativeModules} from 'react-native';
import {registerRootComponent} from 'expo';
import {Asset} from 'expo-asset';

const fromHash = (() => {
  try {
    return JSON.parse(decodeURIComponent(window.location.hash.slice(1)) || '{}');
  } catch (e) {
    return {};
  }
})();
globalThis.__SCENARIO = {
  width: window.innerWidth,
  height: window.innerHeight,
  insets: {top: 0, right: 0, bottom: 0, left: 0},
  fold: null,
  ...fromHash,
};

// iPhone Duo's fold, as the native HolocronFold module would report it.
if (globalThis.__SCENARIO.fold) {
  NativeModules.HolocronFold = {
    getDivisionRegion: () => Promise.resolve(globalThis.__SCENARIO.fold),
    addListener: () => undefined,
    removeListeners: () => undefined,
  };
}

const ionicons = Asset.fromModule(require('react-native-vector-icons/Fonts/Ionicons.ttf')).uri;
const style = document.createElement('style');
style.textContent = [
  `@font-face{font-family:Ionicons;src:url(${ionicons}) format("truetype")}`,
  // Linux has no San Francisco; stand in with Inter under Apple's family names.
  ...['-apple-system', 'BlinkMacSystemFont', 'System'].flatMap(family => [
    `@font-face{font-family:"${family}";src:local("Inter");font-weight:400}`,
    `@font-face{font-family:"${family}";src:local("Inter Medium"),local("Inter-Medium");font-weight:500}`,
    `@font-face{font-family:"${family}";src:local("Inter SemiBold"),local("Inter-SemiBold");font-weight:600}`,
    `@font-face{font-family:"${family}";src:local("Inter Bold"),local("Inter-Bold");font-weight:700}`,
  ]),
  'html,body,#root{height:100%;margin:0;background:#000}',
].join('\n');
document.head.appendChild(style);

const App = require('../App').default;
registerRootComponent(App);
