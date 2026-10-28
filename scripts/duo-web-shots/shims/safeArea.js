/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// Web stand-in for react-native-safe-area-context: the scenario's iPhone Duo
// insets, which a browser cannot report.
const React = require('react');
const {View, StyleSheet} = require('react-native');
const real = require('react-native-safe-area-context/lib/commonjs/SafeAreaContext');
const scenario = () => globalThis.__SCENARIO;
const insets = () => scenario().insets;
const frame = () => ({x: 0, y: 0, width: scenario().width, height: scenario().height});

function SafeAreaProvider({children, style}) {
  return React.createElement(real.SafeAreaFrameContext.Provider, {value: frame()},
    React.createElement(real.SafeAreaInsetsContext.Provider, {value: insets()},
      React.createElement(View, {style: [{flex: 1}, style]}, children)));
}
const useSafeAreaInsets = () => React.useContext(real.SafeAreaInsetsContext) || insets();
const useSafeAreaFrame = () => React.useContext(real.SafeAreaFrameContext) || frame();
function SafeAreaView({edges, style, ...rest}) {
  const value = useSafeAreaInsets();
  const list = Array.isArray(edges) ? edges : edges ? Object.keys(edges).filter(k => edges[k] && edges[k] !== 'off') : ['top', 'right', 'bottom', 'left'];
  const flat = StyleSheet.flatten(style) || {};
  const pad = side => (list.includes(side) ? value[side] : 0) + (flat['padding' + side[0].toUpperCase() + side.slice(1)] || flat.padding || 0);
  return React.createElement(View, {...rest, style: [style, {paddingTop: pad('top'), paddingRight: pad('right'), paddingBottom: pad('bottom'), paddingLeft: pad('left')}]});
}
module.exports = {
  ...real,
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaConsumer: real.SafeAreaInsetsContext.Consumer,
  initialWindowMetrics: {get insets() { return insets(); }, get frame() { return frame(); }},
  withSafeAreaInsets: C => props => React.createElement(C, {...props, insets: useSafeAreaInsets()}),
};
