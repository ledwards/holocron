import {StyleSheet} from 'react-native';
import colors from './colors';

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
  filterQueryContainer: {
    paddingLeft: 7,
    paddingRight: 7,
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
    marginHorizontal: 0,
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
    marginTop: 10,
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
    fontSize: 16,
  },
  defaultTextTitle: {
    marginTop: 40,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});

export default styles;
