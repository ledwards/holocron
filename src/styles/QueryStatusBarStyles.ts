import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  filterQueryContainer: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 30,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    lineHeight: 18,
    alignSelf: 'center',
    marginLeft: 'auto',
  },
  combinedResultsCount: {
    fontSize: 14,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default styles;
