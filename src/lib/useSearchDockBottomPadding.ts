import useBottomClearance from './useBottomClearance';

/**
 * Space under a search dock: exactly the tab bar's height, so the dock's glass
 * sits right on the bar's glass with no gap. Read from the navigator (not from
 * keyboard state) to stay stable through keyboard dismissal and rotation.
 */
export default function useSearchDockBottomPadding(): number {
  return useBottomClearance();
}
