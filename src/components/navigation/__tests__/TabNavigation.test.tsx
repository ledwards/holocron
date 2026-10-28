import React from 'react';
import {render} from '@testing-library/react-native';
import TabNavigation from '../TabNavigation';
import {StyleSheet} from 'react-native';

let mockScreenOptions: any;
let mockTabBar: any;
const mockScreenOptionsByName: Record<string, any> = {};

jest.mock('react-native-elements', () => ({
  Icon: () => null,
}));

let mockInsets = {top: 0, right: 0, bottom: 0, left: 0};
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: (props: any) => {
    const {View} = require('react-native');
    return <View {...props} />;
  },
  useSafeAreaInsets: () => mockInsets,
}));

jest.mock('@react-native-community/blur', () => ({
  BlurView: () => null,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  BottomTabBar: () => null,
  createBottomTabNavigator: () => ({
    Navigator: ({children, screenOptions, tabBar}: {children: React.ReactNode; screenOptions: any; tabBar: any}) => {
      mockScreenOptions = screenOptions;
      mockTabBar = tabBar;
      const ReactLocal = require('react');
      const {View: ViewLocal} = require('react-native');
      return <ViewLocal>{children}</ViewLocal>;
    },
    Screen: ({
      name,
      children,
      options,
    }: {
      name: string;
      children: (() => React.ReactNode) | React.ReactNode;
      options: any;
    }) => {
      mockScreenOptionsByName[name] = options;
      const ReactLocal = require('react');
      const {Text: TextLocal, View: ViewLocal} = require('react-native');
      return (
      <ViewLocal testID={`tab-${name}`}>
        <TextLocal>{name}</TextLocal>
        {typeof children === 'function' ? children() : children}
      </ViewLocal>
    );
    },
  }),
}));

jest.mock('../../cards/CardsScreen', () => () => {
  const ReactLocal = require('react');
  const {Text: TextLocal} = require('react-native');
  return <TextLocal testID="cards-screen">Cards screen</TextLocal>;
});

jest.mock('../../decklists/DecklistsScreen', () => () => {
  const ReactLocal = require('react');
  const {Text: TextLocal} = require('react-native');
  return <TextLocal testID="decklists-screen">Decklists screen</TextLocal>;
});

jest.mock('../../rules/RulesScreen', () => () => {
  const ReactLocal = require('react');
  const {Text: TextLocal} = require('react-native');
  return <TextLocal testID="rules-screen">Rules screen</TextLocal>;
});

describe('TabNavigation', () => {
  it('protects the headerless Rules reader from the status bar and landscape cutouts', () => {
    const {getByTestId} = render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
    expect(getByTestId('rules-safe-area').props.edges).toEqual(['top', 'left', 'right']);
  });
  it('preserves the compact icon-only navigation bar', () => {
    render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
    const barStyle = StyleSheet.flatten(mockScreenOptions.tabBarStyle);
    expect(barStyle.paddingBottom).toBe(0);
    expect(barStyle.height).toBe(62);
    expect(mockScreenOptions.tabBarShowLabel).toBe(false);
    expect(mockScreenOptions.tabBarIconStyle).toEqual({width: 32, height: 32});
    expect(StyleSheet.flatten(mockScreenOptions.tabBarButton({}).props.style).justifyContent).toBe('center');
  });

  it('registers cards, decklists, and rules tabs', () => {
    const {getByTestId} = render(
      <TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />,
    );

    expect(getByTestId('tab-Cards')).toBeTruthy();
    expect(getByTestId('tab-Decklists')).toBeTruthy();
    expect(getByTestId('tab-Rules')).toBeTruthy();
    expect(getByTestId('rules-screen')).toBeTruthy();
  });
});

it('keeps the fixed tab bar free of keyboard-hide translations during resize', () => {
  render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
  expect(mockScreenOptions.tabBarHideOnKeyboard).toBe(false);
});

jest.mock('@react-navigation/elements', () => ({PlatformPressable: 'Pressable'}));

describe('TabNavigation on iPhone Duo', () => {
  const tabBarProps = {state: {index: 0, routes: [{key: 'c', name: 'Cards'}]}, descriptors: {c: {options: {}}}, navigation: {}, insets: {}};
  afterEach(() => {
    mockInsets = {top: 0, right: 0, bottom: 0, left: 0};
  });

  it('keeps the bottom bar and headers on a regular iPhone', () => {
    mockInsets = {top: 62, right: 0, bottom: 34, left: 0};
    const screen = render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
    expect(mockScreenOptions.tabBarPosition).toBe('bottom');
    expect(mockScreenOptionsByName.Cards.headerShown).toBe(true);
    expect(mockTabBar(tabBarProps).type.name).not.toBe('ControlRail');
    expect(screen.getByTestId('rules-safe-area').props.edges).toEqual(['top', 'left', 'right']);
  });

  it('moves tabs and header actions to a strip on the edge where the system put its own', () => {
    mockInsets = {top: 0, right: 54, bottom: 20, left: 0};
    const screen = render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
    expect(mockScreenOptions.tabBarPosition).toBe('right');
    expect(mockTabBar(tabBarProps).type.name).toBe('ControlRail');
    expect(mockTabBar(tabBarProps).props.side).toBe('right');
    expect(mockTabBar(tabBarProps).props.width).toBe(64);
    expect(mockScreenOptionsByName.Cards.headerShown).toBe(false);
    expect(mockScreenOptionsByName.Decklists.headerShown).toBe(false);
    // the strip owns the right edge; screens keep the top and the left
    expect(screen.getByTestId('rules-safe-area').props.edges).toEqual(['top', 'left']);
  });

  it('follows the system to the left edge (Split View, left app)', () => {
    mockInsets = {top: 0, right: 0, bottom: 20, left: 54};
    const screen = render(<TabNavigation allCards={[]} expansionSets={[]} allDecklists={[]} />);
    expect(mockScreenOptions.tabBarPosition).toBe('left');
    expect(screen.getByTestId('rules-safe-area').props.edges).toEqual(['top', 'right']);
  });
});
