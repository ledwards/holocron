import React, {useContext} from 'react';
import {Animated, KeyboardAvoidingView, Platform, View} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import GlassSurface from './GlassSurface';
import DeviceLayoutContext from '../../contexts/DeviceLayoutContext';
import useExpandingDock from '../../lib/useExpandingDock';
import useSearchDockBottomPadding from '../../lib/useSearchDockBottomPadding';
import styles from '../../styles/CardSearchFooterStyles';

interface Props {
  /** Receives the focus handlers for the dock's text input. */
  children: (focus: {onFocus: () => void; onBlur: () => void}) => React.ReactNode;
}

/**
 * The glass panel that holds a screen's search field, docked at the bottom of
 * its browser pane. It sits above the bottom tab bar (which draws its own
 * glass) with clear space between, rides above the keyboard, and widens to the
 * whole workspace while the field has focus.
 */
export default function SearchDock({children}: Props) {
  const clearance = useSearchDockBottomPadding();
  const headerHeight = useHeaderHeight();
  const {placement} = useContext(DeviceLayoutContext);
  const dock = useExpandingDock();
  // Beside iPhone Duo's vertical strip there is no bar below; the glass then
  // reaches the bottom edge itself.
  const barBelow = placement === 'bottom';
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: dock.right}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        keyboardVerticalOffset={headerHeight - clearance + 8}
        style={styles.overlayWrapper}
        pointerEvents="box-none">
        <View pointerEvents="box-none">
          <GlassSurface edge="top">
            <View
              pointerEvents="box-none"
              style={{...styles.glassDockContent, paddingBottom: barBelow ? 0 : clearance}}>
              {children({onFocus: dock.onFocus, onBlur: dock.onBlur})}
            </View>
          </GlassSurface>
          {barBelow && <View pointerEvents="none" style={{height: clearance}} />}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
