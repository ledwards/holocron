import React, {useCallback, useContext, useState} from 'react';
import {Animated, View} from 'react-native';
import GlassSurface from './GlassSurface';
import DeviceLayoutContext from '../../contexts/DeviceLayoutContext';
import useExpandingDock from '../../lib/useExpandingDock';
import useKeyboardLift from '../../lib/useKeyboardLift';
import useSearchDockBottomPadding from '../../lib/useSearchDockBottomPadding';
import {usePaneInsets} from '../../contexts/PaneInsetsContext';
import styles from '../../styles/CardSearchFooterStyles';

interface Props {
  /** Receives the focus handlers for the dock's text input. */
  children: (focus: {onFocus: () => void; onBlur: () => void}) => React.ReactNode;
}

/**
 * The glass panel that holds a screen's search field, docked at the bottom of
 * its browser pane. It sits above the bottom tab bar (which draws its own
 * glass) directly, with no gap, rides above the keyboard, and widens to the
 * whole workspace while the field has focus.
 */
export default function SearchDock({children}: Props) {
  const clearance = useSearchDockBottomPadding();
  const {placement} = useContext(DeviceLayoutContext);
  const dock = useExpandingDock();
  const [focused, setFocused] = useState(false);
  const keyboard = useKeyboardLift(clearance, focused);
  const onFocus = useCallback(() => {setFocused(true); dock.onFocus();}, [dock.onFocus]);
  const onBlur = useCallback(() => {setFocused(false); dock.onBlur();}, [dock.onBlur]);
  // Clear of the iPhone Duo strip, which floats over the pane's edge.
  const insets = usePaneInsets();
  // Beside iPhone Duo's vertical strip there is no bar below; the glass then
  // reaches the bottom edge itself.
  const barBelow = placement === 'bottom';
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{position: 'absolute', top: 0, bottom: 0, left: insets.left,
        right: insets.right ? Animated.add(dock.right, insets.right) : dock.right}}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.overlayWrapper, {transform: [{translateY: keyboard.translateY}]}]}>
        <View ref={keyboard.ref} testID="search-dock" pointerEvents="box-none">
          <GlassSurface edge="top">
            <View
              pointerEvents="box-none"
              style={{...styles.glassDockContent, paddingBottom: barBelow ? 0 : clearance}}>
              {children({onFocus, onBlur})}
            </View>
          </GlassSurface>
          {barBelow && <View pointerEvents="none" style={{height: clearance}} />}
        </View>
      </Animated.View>
    </Animated.View>
  );
}
