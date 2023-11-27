import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  defaultTextContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 7,
  },
  defaultTextIcon: {
    marginLeft: 5,
    marginRight: 5,
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
});

export default styles;
