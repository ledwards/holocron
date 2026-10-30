import React, {useContext} from 'react';
import {View, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import GlassSurface from '../glass/GlassSurface';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import ThemeContext from '../../contexts/ThemeContext';

interface ControlRailProps extends BottomTabBarProps {
  side: 'left' | 'right';
  width: number;
  topInset: number;
  bottomInset: number;
}

/**
 * Room for the system's own status items (time, connectivity), which iPhone
 * Duo draws at the top of the strip, down to about 160 points (measured on
 * the simulator, closed upright). iOS hides them at compact heights (closed,
 * landscape), where only the Dynamic Island clearance remains. The screen's
 * actions go below, or the system draws over them.
 */
const COMPACT_HEIGHT = 500;
export function stripStatusRoom(windowHeight: number): number {
  return windowHeight >= COMPACT_HEIGHT ? 168 : 24;
}

/**
 * The vertical control strip used where iPhone Duo puts the system's own bars
 * on one edge (closed, and open in landscape). Top to bottom, as Apple orders
 * it: the focused screen's navigation action (its header's left button, e.g.
 * Back), its prominent action (the header's right button, e.g. the deck mode),
 * then the tabs at the bottom. Same icons, test IDs and labels as the bottom
 * bar; only their position changes.
 */
export default function ControlRail({state, descriptors, navigation, side, width, topInset, bottomInset}: ControlRailProps) {
  const theme = useContext(ThemeContext);
  const window = useWindowDimensions();
  const focused = descriptors[state.routes[state.index].key];
  const {headerLeft, headerRight} = focused.options;
  const tintColor = theme?.foregroundColor;

  return (
    <View
      testID="control-rail"
      style={{
        // Floats over the screens (which run beneath it with its width as an
        // inset) so the glass shows the content under it, as iPhone Duo's own
        // bars do; an app that sits beside the strip looks letterboxed.
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: 0,
        zIndex: 10,
        width,
        paddingTop: topInset + stripStatusRoom(window.height),
        paddingBottom: bottomInset + 12,
        alignItems: 'center',
        borderColor: 'rgba(255,255,255,0.22)',
        borderLeftWidth: side === 'right' ? StyleSheet.hairlineWidth : 0,
        borderRightWidth: side === 'left' ? StyleSheet.hairlineWidth : 0,
      }}>
      <GlassSurface style={StyleSheet.absoluteFill} />
      <View testID="control-rail-actions" style={{alignItems: 'center', gap: 6}}>
        {headerLeft?.({tintColor, canGoBack: false})}
        {headerRight?.({tintColor, canGoBack: false})}
      </View>
      <View style={{flex: 1}} />
      <View accessibilityRole="tablist" style={{alignItems: 'center', gap: 10}}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.tabBarAccessibilityLabel
            ?? (typeof options.tabBarLabel === 'string' ? options.tabBarLabel : route.name);
          const onPress = () => {
            const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <Pressable
              key={route.key}
              testID={options.tabBarButtonTestID}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{selected: isFocused}}
              onPress={onPress}
              onLongPress={() => navigation.emit({type: 'tabLongPress', target: route.key})}
              style={{width: 48, height: 48, borderRadius: 20, alignItems: 'center', justifyContent: 'center'}}>
              {options.tabBarIcon?.({focused: isFocused, color: tintColor || '#FFFFFF', size: 28})}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
