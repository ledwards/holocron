import {renderHook} from '@testing-library/react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import useSearchDockBottomPadding from '../useSearchDockBottomPadding';

jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: jest.fn(() => 83)}));

describe('search dock navigation clearance', () => {
  it('tracks the current navigator height without keyboard event state', () => {
    const {result, rerender} = renderHook(() => useSearchDockBottomPadding());
    expect(result.current).toBe(85);
    (useBottomTabBarHeight as jest.Mock).mockReturnValue(49);
    rerender({});
    expect(result.current).toBe(60);
  });
});
