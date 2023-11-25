import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  cardListItemContainer: {
    overflow: 'hidden',
    height: '100%',
  },
  cardListItemContainerDarkSide: {
    backgroundColor: colors.dark,
  },
  cardListItemContainerLightSide: {
    backgroundColor: colors.white,
  },
  cardListItem: {
    backgroundColor: colors.black,
    position: 'absolute',
  },
  cardListItemExpanded: {
    overflow: 'hidden',
    right: -60,
  },
  cardListItemCollapsed: {
    right: 0,
  },
  cardListItemImage: {
    borderRadius: 14,
    height: '100%',
  },
  cardListItemImageExpanded: {
    position: 'relative',
    left: -30,
    top: 0,
  },
  cardListItemImageCollapsed: {
    left: 0,
  },
  cardListItemTitle: {
    fontWeight: 'bold',
  },
  cardListItemTitleLight: {
    backgroundColor: colors.alphaWhite,
    color: colors.dark,
  },
  cardListItemTitleDark: {
    backgroundColor: colors.alphaDark,
    color: colors.light,
  },
  cardListItemTitleLong: {
    fontSize: 10,
  },
  cardListItemTitleShort: {
    fontSize: 16,
  },
  cardListItemSubtitle: {
    fontSize: 12,
  },
  cardListItemSubtitleLight: {
    backgroundColor: colors.alphaWhite,
    color: colors.dark,
  },
  cardListItemSubtitleDark: {
    backgroundColor: colors.alphaDark,
    color: colors.light,
  },
});

export default styles;
