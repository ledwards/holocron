/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

// Screenshot build only (run.sh puts this in a temporary copy): native modules
// with no web implementation resolve to stand-ins under shots/shims on web.
const SHIMS = {
  'react-native-blob-util': 'shots/shims/blobUtil.js',
  'react-native-fast-image': 'shots/shims/fastImage.js',
  '@react-native-community/blur': 'shots/shims/blur.js',
  'react-native-safe-area-context': 'shots/shims/safeArea.js',
};

const base = getDefaultConfig(__dirname);
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (platform === 'web' && SHIMS[moduleName] && !context.originModulePath.includes(`${path.sep}shots${path.sep}shims${path.sep}`)) {
        return {type: 'sourceFile', filePath: path.join(__dirname, SHIMS[moduleName])};
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
module.exports = mergeConfig(base, config);
