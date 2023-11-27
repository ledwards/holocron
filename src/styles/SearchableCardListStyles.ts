import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableCardListContainer: {
    overflow: 'hidden',
  },
  listEmptyContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  defaultTextTitle: {
    marginTop: 40,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  defaultTextDescription: {
    padding: 18,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
});

export default styles;
