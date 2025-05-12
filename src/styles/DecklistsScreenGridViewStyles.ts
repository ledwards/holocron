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
    justifyContent: 'center',
    alignItems: 'center',
  },
  decklistGridImage: {
    borderRadius: 5,
    width: '100%',
    height: '100%',
  },

  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
});

export default styles;
