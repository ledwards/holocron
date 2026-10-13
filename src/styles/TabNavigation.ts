import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    // Preserve the compact, icon-only bar; center controls in its visible band.
    height: 62,
    paddingBottom: 0,
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
    marginLeft: 12,
    marginRight: 12,
  },
});

export default styles;
