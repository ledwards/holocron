import React from 'react';
import {render} from '@testing-library/react-native';
import TabNavigation from '../TabNavigation';
import {StyleSheet} from 'react-native';

let mockScreenOptions: any;

jest.mock('react-native-elements', () => ({
  Icon: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: (props: any) => {
    const {View} = require('react-native');
    return <View {...props} />;
  },
}));

jest.mock('@react-native-community/blur', () => ({
  BlurView: () => null,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children, screenOptions}: {children: React.ReactNode; screenOptions: any}) => {
      mockScreenOptions = screenOptions;
      const ReactLocal = require('react');
      const {View: ViewLocal} = require('react-native');
      return <ViewLocal>{children}</ViewLocal>;
    },
    Screen: ({
      name,
      children,
    }: {
      name: string;
      children: (() => React.ReactNode) | React.ReactNode;
    }) => {
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
