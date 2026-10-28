import {useContext} from 'react';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import DeviceLayoutContext from '../contexts/DeviceLayoutContext';

/**
 * Space to leave at the bottom of a screen: the tab bar (at least
 * `minimumTabBar`) when it is at the bottom, only the home-indicator inset when
 * the controls are in a vertical strip on iPhone Duo.
 */
export default function useBottomClearance(minimumTabBar = 0): number {
  const {placement, bottomInset} = useContext(DeviceLayoutContext);
  const tabBarHeight = useBottomTabBarHeight();
  return placement === 'bottom' ? Math.max(tabBarHeight, minimumTabBar) : bottomInset;
}
