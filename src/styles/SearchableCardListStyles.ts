import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
  header: {
    // borderBottomWidth: 0,
  },
  headerWithEmptyQuery: {
    // borderBottomWidth: 0,
  },
  headerWithQuery: {
    borderBottomWidth: 0,
  },
  searchBarInput: {},
  searchBarInputContainer: {
    // backgroundColor: colors.black,
  },
  searchBarContainer: {
    borderTopWidth: 0, //works
    borderBottomWidth: 0, //works
    // backgroundColor: colors.dark,
  },
  filterQueryContainer: {
    // backgroundColor: colors.dark,
    borderBottomWidth: 2,
    paddingLeft: 2,
    paddingRight: 2,
    flex: 1,
    flexDirection: 'row',
  },
  chipButton: {
    // backgroundColor: colors.black,
    // borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginTop: 6,
    marginHorizontal: 2,
  },
  // chipButtonWithMatch: {
  // backgroundColor: colors.black,
  // borderColor: colors.terminalGreen,
  // borderWidth: 1,
  // borderRadius: 10,
  // paddingHorizontal: 4,
  // paddingVertical: 0,
  // marginTop: 6,
  // marginHorizontal: 2,
  // },
  chipContainer: {
    marginHorizontal: 0,
  },
  chipTitle: {
    // color: colors.red,
    fontSize: 14,
  },
  // chipTitleWithMatch: {
  // color: colors.terminalGreen,
  // fontSize: 14,
  // },
  resultsCount: {
    fontSize: 14,
    alignSelf: 'center',
    marginLeft: 'auto',
  },
  resultsCountWithMatch: {
    // color: colors.white,
  },
  resultsCountWithNoMatch: {
    // color: colors.gray,
  },
  combinedResultsCount: {
    // color: colors.white,
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
  defaultText: {
    // flex: 1,
    // marginTop: 50,
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
