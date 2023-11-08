module.exports = {
  presets: ['module:metro-react-native-babel-preset'],

  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-flow-strip-types',
      ],
    },
  },
};
