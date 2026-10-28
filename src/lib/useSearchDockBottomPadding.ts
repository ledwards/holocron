import useBottomClearance from './useBottomClearance';

/** Keep navigation clearance stable through keyboard dismissal and rotation. */
export default function useSearchDockBottomPadding(): number {
  return useBottomClearance(58) + 2;
}
