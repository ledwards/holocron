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

  dividerColor: colors.light,
  chipYesTextColor: backgroundColor,
  chipNoTextColor: backgroundColor,
  chipYesBorderColor: colors.darkGreen,
  chipNoBorderColor: colors.darkRed,
  chipYesBackgroundColor: colors.darkGreen,
  chipNoBackgroundColor: colors.red,

  statusBarStyle: 'dark-content',
};

export default themeLight;
