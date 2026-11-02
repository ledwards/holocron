import React, {useContext} from 'react';
import {View, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import ThemeContext from '../../contexts/ThemeContext';
import GlassSurface from '../glass/GlassSurface';

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
 * The search docks and the Rules reader bar run edge to edge, under the strip,
 * so the tabs ride above them (a dock is about 140 points with the home
 * indicator) instead of cutting them short. Where the window is too short to
 * spare it (closed, landscape), the lift shrinks to what fits.
 */
const BAR_LIFT = 124;
const RAIL_ACTIONS_ROOM = 110;
const RAIL_TABS_HEIGHT = 164;
const ISLAND_RADIUS = 28;
const ISLAND_PADDING = 6;
export function railBarLift(windowHeight: number, topClearance: number, bottomInset: number): number {
  const spare = windowHeight - topClearance - bottomInset - 12 - RAIL_TABS_HEIGHT - RAIL_ACTIONS_ROOM;
  return Math.max(0, Math.min(BAR_LIFT, spare));
}

/**
 * The vertical control strip used where iPhone Duo puts the system's own bars
 * on one edge (closed, and open in landscape). Grouped at the foot of the
 * strip, below the system's status items, top to bottom: the focused screen's
 * navigation action (its header's left button, e.g.
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
  // Each cluster rides on its own glass island, so icons stay legible over
  // whatever scrolls beneath the transparent strip. The shadow lifts the island
  // off the content; GlassSurface clips, so it lives on the wrapper.
  const island = {
    borderRadius: ISLAND_RADIUS,
    shadowColor: '#000000',
    shadowOpacity: theme?.name === 'light' ? 0.16 : 0.4,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
  };

  return (
    <View
      testID="control-rail"
      style={{
        // Transparent and floating over the screens (which run beneath it
        // with its width as an inset), as iPhone Duo's own strip does: only
        // the controls sit on the content. An app that sits beside the strip,
        // or paints it, looks letterboxed.
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: 0,
        zIndex: 10,
        width,
        paddingTop: topInset + stripStatusRoom(window.height),
        paddingBottom: bottomInset + 12 + railBarLift(window.height, topInset + stripStatusRoom(window.height), bottomInset),
        alignItems: 'center',
        // Actions and tabs sit together at the foot of the strip, well below
        // the system's status items, which can run deep on some displays.
        justifyContent: 'flex-end',
      }}
      // Touches between the controls reach the content underneath.
      pointerEvents="box-none">
      {(headerLeft || headerRight) && (
        <View testID="control-rail-actions" pointerEvents="box-none" style={[island, {marginBottom: 12}]}>
          <GlassSurface edge="all" radius={ISLAND_RADIUS} style={StyleSheet.absoluteFill} />
          <View pointerEvents="box-none" style={{alignItems: 'center', gap: 6, padding: ISLAND_PADDING}}>
            {headerLeft?.({tintColor, canGoBack: false})}
            {headerRight?.({tintColor, canGoBack: false})}
          </View>
        </View>
      )}
      <View accessibilityRole="tablist" pointerEvents="box-none" style={island}>
        <GlassSurface edge="all" radius={ISLAND_RADIUS} style={StyleSheet.absoluteFill} />
        <View pointerEvents="box-none" style={{alignItems: 'center', gap: 6, padding: ISLAND_PADDING}}>
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
    </View>
  );
}
