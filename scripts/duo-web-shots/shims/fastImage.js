/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');
const {Image} = require('react-native');
const FastImage = React.forwardRef((props, ref) => React.createElement(Image, {...props, ref}));
FastImage.resizeMode = {contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center'};
FastImage.priority = {low: 'low', normal: 'normal', high: 'high'};
FastImage.preload = () => undefined;
module.exports = FastImage;
module.exports.default = FastImage;
