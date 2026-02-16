import React from 'react';
import {render} from '@testing-library/react-native';
import TabNavigation from '../TabNavigation';

jest.mock('react-native-elements', () => ({
  Icon: () => null,
}));

jest.mock('@react-native-community/blur', () => ({
  BlurView: () => null,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => {
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
