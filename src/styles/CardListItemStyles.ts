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
  cardListItemQuantityContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '12%',
  },
  cardListItemQuantityBlur: {
    width: '100%',
    height: '100%',
  },
  cardListItemQuantityText: {
    fontWeight: 'bold',
    position: 'absolute',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: '45%',
    width: '100%',
    height: '100%',
  },
});

export default styles;
