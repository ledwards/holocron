/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// The web cannot blur behind a native view; stand in with the translucent
// colour the app itself uses as its reduced-transparency fallback.
const React = require('react');
const {View} = require('react-native');
function BlurView({style, blurType, children}) {
  return React.createElement(View, {style: [style, {backgroundColor: blurType === 'light' ? 'rgba(255,255,255,0.82)' : 'rgba(18,20,22,0.88)'}]}, children);
}
module.exports = {BlurView, VibrancyView: BlurView, default: BlurView};
