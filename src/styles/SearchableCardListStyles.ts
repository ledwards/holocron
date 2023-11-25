import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
  searchBarContainer: {
    borderTopWidth: 0, // must specify individually for some reason
    borderBottomWidth: 0, // must specify individually for some reason
  },
  filterQueryContainer: {
    paddingLeft: 2,
    paddingRight: 2,
    flex: 1,
    flexDirection: 'row',
  },
  chipButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginTop: 6,
    marginHorizontal: 2,
  },
  chipContainer: {
    marginHorizontal: 5,
  },
  chipTitle: {
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 14,
    alignSelf: 'center',
    marginLeft: 'auto',
  },
  combinedResultsCount: {
    fontSize: 14,
    alignSelf: 'center',
    margin: 5,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableCardListContainer: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  defaultTextContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
  },
  defaultTextIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
  defaultTextDescription: {
    padding: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default styles;
