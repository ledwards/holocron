import {renderHook} from '@testing-library/react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import useSearchDockBottomPadding from '../useSearchDockBottomPadding';

jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: jest.fn(() => 83)}));

describe('search dock navigation clearance', () => {
  it('is exactly the tab bar height, so the dock sits on the bar with no gap', () => {
    const {result, rerender} = renderHook(() => useSearchDockBottomPadding());
    expect(result.current).toBe(83);
    (useBottomTabBarHeight as jest.Mock).mockReturnValue(62);
    rerender({});
    expect(result.current).toBe(62);
  });
});
