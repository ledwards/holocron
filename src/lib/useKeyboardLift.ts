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
 * Raises a bottom dock above the iOS keyboard. Unlike KeyboardAvoidingView,
 * it measures the dock's real window position each time the keyboard moves
 * (so iPhone Duo posture changes can't leave a stale offset) and always
 * returns to zero when the keyboard hides.
 */
export default function useKeyboardLift(clearance: number) {
  const ref = useRef<View>(null);
  const lift = useRef(new Animated.Value(0)).current;
  const current = useRef(0);
  const clearanceRef = useRef(clearance);
  clearanceRef.current = clearance;

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const move = (toValue: number, duration: number) => {
      current.current = toValue;
      Animated.timing(lift, {toValue: -toValue, duration: duration || 0,
        easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
    };
    const change = ({endCoordinates, duration}: KeyboardEvent) => {
      const windowHeight = Dimensions.get('window').height;
      if (endCoordinates.screenY >= windowHeight || !ref.current) {
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
    const subscriptions = [
      Keyboard.addListener('keyboardWillChangeFrame', change),
      Keyboard.addListener('keyboardWillHide', ({duration}) => move(0, duration)),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [lift]);

  return {ref, translateY: lift};
}
