import {useCallback, useContext, useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import WorkspaceLayoutContext from '../contexts/WorkspaceLayoutContext';

/** Fast enough to keep up with the keyboard, long enough to read as motion. */
export const DOCK_ANIMATION_MS = 180;

/**
 * Lets a search dock that lives in a narrow browser pane span the whole
 * workspace while its field has focus (the keyboard is up), and settle back to
 * the pane's width when focus leaves. Use `right` as the dock wrapper's
 * (negative) right offset; pass `onFocus` and `onBlur` to the text input.
 */
export default function useExpandingDock() {
  const {dockExpansion} = useContext(WorkspaceLayoutContext);
  const progress = useRef(new Animated.Value(0)).current;
  const animate = useCallback((toValue: number) => {
    Animated.timing(progress, {
      toValue,
      duration: DOCK_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);
  useEffect(() => () => progress.stopAnimation(), [progress]);
  const right = progress.interpolate({inputRange: [0, 1], outputRange: [0, -dockExpansion]});
  return {
    right,
    onFocus: useCallback(() => animate(1), [animate]),
    onBlur: useCallback(() => animate(0), [animate]),
  };
}
