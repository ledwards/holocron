import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  decklistListItemContainer: {
    overflow: 'hidden',
    height: '100%',
  },
  decklistListItemContainerDarkSide: {
    backgroundColor: colors.dark,
  },
  decklistListItemContainerLightSide: {
    backgroundColor: colors.white,
  },
  decklistListItem: {
    backgroundColor: colors.black,
    position: 'absolute',
  },
  decklistListItemExpanded: {
    overflow: 'hidden',
    right: -60,
  },
  decklistListItemCollapsed: {
    right: 0,
  },
  decklistListItemImage: {
    borderRadius: 14,
    height: '100%',
  },
  decklistListItemImageExpanded: {
    position: 'relative',
    left: -30,
    top: 0,
  },
  decklistListItemImageCollapsed: {
    left: 0,
  },
  decklistListItemTitle: {
    fontWeight: 'bold',
  },
  decklistListItemTitleLight: {
    backgroundColor: colors.alphaWhite,
    color: colors.dark,
  },
  decklistListItemTitleDark: {
    backgroundColor: colors.alphaDark,
    color: colors.light,
  },
  decklistListItemTitleLong: {
    fontSize: 10,
  },
  decklistListItemTitleShort: {
    fontSize: 16,
  },
  decklistListItemSubtitle: {
    fontSize: 12,
  },
  decklistListItemSubtitleLight: {
    backgroundColor: colors.alphaWhite,
    color: colors.dark,
  },
  decklistListItemSubtitleDark: {
    backgroundColor: colors.alphaDark,
    color: colors.light,
  },
});

export default styles;
