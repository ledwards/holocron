import {useEffect, useRef} from 'react';
import {Animated, Dimensions, Easing, Keyboard, KeyboardEvent, Platform, View} from 'react-native';

/** Space kept between the dock's glass and the top of the keyboard. */
export const KEYBOARD_GAP = 8;

/**
 * How far to raise a dock whose (unraised) bottom edge sits at `dockBottom`
 * in window points so its glass clears a keyboard whose top is `keyboardTop`.
 * The dock's bottom `clearance` (space kept for the tab bar) may slide under
 * the keyboard. A keyboard at or below the window's bottom edge lifts nothing.
 */
export function keyboardLift(dockBottom: number, keyboardTop: number,
  windowHeight: number, clearance: number): number {
  if (keyboardTop >= windowHeight) return 0;
  return Math.max(0, dockBottom - keyboardTop - clearance + KEYBOARD_GAP);
}

/**
 * Raises a bottom dock above the iOS keyboard while the dock's own field has
 * focus (`active`). Unlike KeyboardAvoidingView, it measures the dock's real
 * window position each time the keyboard moves (so iPhone Duo posture changes
 * can't leave a stale offset), always returns to zero when the keyboard hides,
 * and ignores keyboard frames while its field isn't focused: opening or
 * folding iPhone Duo sends frame changes for no visible keyboard, which once
 * threw an unfocused dock to the top of the screen.
 */
export default function useKeyboardLift(clearance: number, active = true) {
  const ref = useRef<View>(null);
  const lift = useRef(new Animated.Value(0)).current;
  const current = useRef(0);
  const clearanceRef = useRef(clearance);
  clearanceRef.current = clearance;
  const activeRef = useRef(active);
  activeRef.current = active;
  const handlers = useRef<{change: (event: KeyboardEvent) => void; move: (to: number, duration: number) => void} | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const move = (toValue: number, duration: number) => {
      current.current = toValue;
      Animated.timing(lift, {toValue: -toValue, duration: duration || 0,
        easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
    };
    const change = ({endCoordinates, duration}: KeyboardEvent) => {
      const windowHeight = Dimensions.get('window').height;
      if (!activeRef.current || endCoordinates.screenY >= windowHeight || !ref.current) {
        move(0, duration);
        return;
      }
      ref.current.measureInWindow((_x, y, _width, height) => {
        // The measurement includes the lift already applied; undo it.
        const bottom = y + height + current.current;
        move(keyboardLift(bottom, endCoordinates.screenY, windowHeight,
          clearanceRef.current), duration);
      });
    };
    handlers.current = {change, move};
    const subscriptions = [
      Keyboard.addListener('keyboardWillChangeFrame', change),
      Keyboard.addListener('keyboardWillHide', ({duration}) => move(0, duration)),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [lift]);

  // Focus can arrive after the keyboard's own event: catch up from the
  // keyboard's current frame. Losing focus always drops the dock.
  useEffect(() => {
    const handler = handlers.current;
    if (!handler) return;
    const metrics = Keyboard.metrics?.();
    if (active && metrics) {
      handler.change({endCoordinates: metrics, duration: 0} as KeyboardEvent);
    } else if (!active) {
      handler.move(0, 0);
    }
  }, [active]);

  return {ref, translateY: lift};
}
