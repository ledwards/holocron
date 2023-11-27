import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
  searchBarContainer: {
    borderTopWidth: 0, // must specify individually for some reason
    borderBottomWidth: 0, // must specify individually for some reason
    backgroundColor: 'transparent',
    width: '100%',
    position: 'absolute',
  },
  filterQuerySetContainer: {
    position: 'absolute',
    width: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableCardListContainer: {
    overflow: 'hidden',
  },
  defaultTextContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 7,
  },
  listEmptyContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  defaultTextIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
  defaultTextDescription: {
    padding: 18,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  defaultTextTitle: {
    marginTop: 40,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  footerContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

export default styles;
