import React from 'react';
import {act, renderHook} from '@testing-library/react-native';
import useExpandingDock, {DOCK_ANIMATION_MS} from '../useExpandingDock';
import WorkspaceLayoutContext from '../../contexts/WorkspaceLayoutContext';

const withExpansion = (dockExpansion: number) =>
  ({children}: {children: React.ReactNode}) => (
    <WorkspaceLayoutContext.Provider value={{dockExpansion}}>{children}</WorkspaceLayoutContext.Provider>
  );
const offset = (right: unknown) => (right as {__getValue: () => number}).__getValue();

describe('useExpandingDock', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('rests at its pane width, widens over the detail pane while focused, and settles back', () => {
    const {result} = renderHook(() => useExpandingDock(), {wrapper: withExpansion(546)});
    expect(offset(result.current.right)).toBeCloseTo(0);

    act(() => result.current.onFocus());
    act(() => {jest.advanceTimersByTime(DOCK_ANIMATION_MS + 50);});
    expect(offset(result.current.right)).toBeCloseTo(-546);

    act(() => result.current.onBlur());
    act(() => {jest.advanceTimersByTime(DOCK_ANIMATION_MS + 50);});
    expect(offset(result.current.right)).toBeCloseTo(0);
  });

  it('is part way across mid-animation, not a jump', () => {
    const {result} = renderHook(() => useExpandingDock(), {wrapper: withExpansion(500)});
    act(() => result.current.onFocus());
    act(() => {jest.advanceTimersByTime(DOCK_ANIMATION_MS / 2);});
    const midway = offset(result.current.right);
    expect(midway).toBeLessThan(0);
    expect(midway).toBeGreaterThan(-500);
  });

  it('does not move when there is no room to grow (compact width, or beside a fold)', () => {
    const {result} = renderHook(() => useExpandingDock(), {wrapper: withExpansion(0)});
    act(() => result.current.onFocus());
    act(() => {jest.advanceTimersByTime(DOCK_ANIMATION_MS + 50);});
    expect(offset(result.current.right)).toBeCloseTo(0);
  });
});
