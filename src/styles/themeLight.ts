import colors from './colors';

const foregroundColor = colors.black;
const backgroundColor = colors.white;
const secondaryForegroundColor = colors.dark;
const secondaryBackgroundColor = colors.light;

const themeLight = {
  name: 'light',
  foregroundColor: foregroundColor,
  backgroundColor: backgroundColor,
  secondaryForegroundColor: secondaryForegroundColor,
  secondaryBackgroundColor: secondaryBackgroundColor,
  disabledColor: colors.gray,
  iconColor: foregroundColor,
  yesColor: colors.darkGreen,
  noColor: colors.red,

  dividerColor: colors.light,

  statusBarStyle: 'dark-content',
};

export default themeLight;
