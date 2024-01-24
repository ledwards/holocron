import {Platform, StatusBar} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import FilterQuerySet from '../models/FilterQuerySet';

const nativeHeaderTopHeight = () => {
  if (Platform.OS === 'android') {
    return 0;
  } else if (DeviceInfo.hasNotch()) {
    return 44;
  } else {
    return 0;
  }
};

const statusBarHeight = () =>
  Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const nativeFooterHeight = () => {
  if (Platform.OS === 'android') {
    return 0;
  } else if (DeviceInfo.hasNotch()) {
    return 24;
  } else {
    return 0;
  }
};

const searchBarHeight = () => 30;
const tabBarHeight = () => 44;

const filterQuerySetHeight = (filterQuerySet: FilterQuerySet) =>
  45 + 25 * filterQuerySet.length() + (filterQuerySet.length() > 1 ? 35 : 0);

const nativeHeaderHeight = () => statusBarHeight() + nativeHeaderTopHeight();

const keyboardVerticalOffset = () =>
  -1 * (nativeFooterHeight() + tabBarHeight());

const footerHeight = (tabBarHeight: number, filterQuerySet: FilterQuerySet) =>
  nativeFooterHeight() +
  tabBarHeight +
  searchBarHeight() +
  (filterQuerySet ? filterQuerySetHeight(filterQuerySet) : 0);

const searchBottomPosition = (tabBarHeight: number) =>
  nativeFooterHeight() + tabBarHeight + searchBarHeight();

const statusBarBottomPosition = tabBarHeight =>
  nativeFooterHeight() +
  tabBarHeight +
  searchBarHeight() + // search bar needs this for some reason, half its height is in the position
  searchBarHeight();

export default {
  nativeHeaderTopHeight,
  nativeHeaderHeight,
  nativeFooterHeight,
  statusBarHeight,
  searchBarHeight,
  tabBarHeight,
  keyboardVerticalOffset,
  footerHeight,
  searchBottomPosition,
  statusBarBottomPosition,
};
