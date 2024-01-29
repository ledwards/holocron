import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  decklistView: {},
  decklistViewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  decklistViewSubtitle: {
    fontSize: 18,
    lineHeight: 28,
  },
  decklistViewBody: {
    fontSize: 18,
    lineHeight: 28,
  },

  decklistGridColumn: {},
  decklistGridInner: {
    flexDirection: 'row',
  },
  decklistGridImage: {
    borderRadius: 5,
  },

  scrollView: {
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
});

export default styles;
