import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    borderTopWidth: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    height: 62,
  },
  tabBarBackground: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  headerBackground: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },

  tabBarItemStyle: {
    borderRadius: 20,
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 12,
    marginRight: 12,
  },
});

export default styles;
