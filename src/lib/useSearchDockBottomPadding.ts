import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

/** Keep navigation clearance stable through keyboard dismissal and rotation. */
export default function useSearchDockBottomPadding(): number {
  return Math.max(useBottomTabBarHeight(), 58) + 2;
}
