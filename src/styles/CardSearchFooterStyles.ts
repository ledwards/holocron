import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  modeCoachTip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
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
  overlayWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassDockContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.28)',
  },
  glassDockBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  glassDockContent: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  statusRowSlot: {
    width: '100%',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchBarContainer: {
    borderTopWidth: 0, // must specify individually for some reason
    borderBottomWidth: 0, // must specify individually for some reason
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  searchBarTight: {
    marginTop: 0,
    marginBottom: 0,
  },
  filterQuerySetContainer: {
    position: 'absolute',
    width: '100%',
  },
});

export default styles;
