import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 2,
  },
  headerWithEmptyQuery: {
    borderBottomColor: colors.black,
  },
  headerWithQuery: {
    borderBottomColor: colors.transparent,
  },
  searchBar: {
    fontSize: 16,
  },
  filterQueryContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'left',
  },
  chipButton: {
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginTop: 6,
    marginHorizontal: 2,
  },
  chipButtonWithMatch: {
    borderColor: colors.terminalGreen,
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
    color: colors.red,
    fontSize: 14,
  },
  chipTitleWithMatch: {
    color: colors.terminalGreen,
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 14,
    alignSelf: 'center',
    marginLeft: 'auto',
  },
  resultsCountWithMatch: {
    color: colors.white,
  },
  resultsCountWithNoMatch: {
    color: colors.gray,
  },
  combinedResultsCount: {
    fontSize: 14,
    color: colors.white,
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
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  defaultTextContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
  },
  defaultText: {
    color: colors.white,
  },
  defaultTextIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
  defaultTextDescription: {
    color: colors.white,
    padding: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default styles;
