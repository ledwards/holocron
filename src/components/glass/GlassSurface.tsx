import React, {useContext} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import ThemeContext from '../../contexts/ThemeContext';

export type GlassEdge = 'top' | 'left' | 'right' | 'bottom' | 'all' | 'none';

interface Props {
  /** Which edge(s) get the light specular hairline. */
  edge?: GlassEdge;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}

/**
 * The app's one glass material: a blur, a thin tint that keeps text legible
 * over any artwork, and a hairline highlight on the exposed edge. The tab bar,
 * the control rail, the search docks and the Rules reader bar all use it, so no
 * screen has to draw its own glass (or goes without).
 */
export default function GlassSurface({edge = 'none', radius = 0, style, children, testID}: Props) {
  const theme = useContext(ThemeContext);
  const dark = theme?.name !== 'light';
  const hairline = StyleSheet.hairlineWidth;
  const width = (side: GlassEdge) => (edge === 'all' || edge === side ? hairline : 0);
  return (
    <View
      testID={testID}
      style={[
        {
          overflow: 'hidden',
          borderRadius: radius,
          borderColor: dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.14)',
          borderTopWidth: width('top'),
          borderLeftWidth: width('left'),
          borderRightWidth: width('right'),
          borderBottomWidth: width('bottom'),
        },
        style,
      ]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        // Ultra-thin material with a small blur radius: content under the
        // header, tab bar and iPhone Duo strip stays recognisable (glass, not a
        // frosted panel); the tint below keeps text and icons legible.
        blurType={dark ? 'dark' : 'light'}
        blurAmount={3}
        reducedTransparencyFallbackColor={theme?.translucentBackgroundColor}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, {backgroundColor: dark ? 'rgba(12,12,14,0.24)' : 'rgba(255,255,255,0.28)'}]}
      />
      {children}
    </View>
  );
}
