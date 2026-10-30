import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import ControlRail from '../ControlRail';

const routes = [{key: 'c', name: 'Cards'}, {key: 'd', name: 'Decklists'}, {key: 'r', name: 'Rules'}];
const icon = (name: string) => () => <Text>{`${name} icon`}</Text>;

const renderRail = (index = 1, headerActions = true) => {
  const navigation = {
    emit: jest.fn(() => ({defaultPrevented: false})),
    navigate: jest.fn(),
  };
  const descriptors = {
    c: {options: {tabBarLabel: 'Search', tabBarButtonTestID: 'tab-cards', tabBarIcon: icon('cards')}},
    d: {options: {
      tabBarLabel: 'Decklists', tabBarButtonTestID: 'tab-decklists', tabBarIcon: icon('decks'),
      headerLeft: headerActions ? () => <Text testID="adaptive-back">back</Text> : undefined,
      headerRight: headerActions ? () => <Text testID="deck-mode-toggle">mode</Text> : undefined,
    }},
    r: {options: {tabBarLabel: 'Rules', tabBarButtonTestID: 'tab-rules', tabBarIcon: icon('rules')}},
  };
  const screen = render(
    <ControlRail state={{index, routes} as never} descriptors={descriptors as never} navigation={navigation as never}
      insets={{top: 0, right: 54, bottom: 20, left: 0}} side="right" width={64} topInset={0} bottomInset={20} />,
  );
  return {screen, navigation};
};

describe('ControlRail', () => {
  it("puts the focused screen's Back first, then its mode action, at the top", () => {
    const {screen} = renderRail();
    const actions = screen.getByTestId('control-rail-actions');
    const ids = actions.props.children.filter(Boolean).map((child: {props: {testID?: string}}) => child.props.testID);
    expect(ids).toEqual(['adaptive-back', 'deck-mode-toggle']);
  });

  it('shows no actions when the screen has none', () => {
    const {screen} = renderRail(0, false);
    expect(screen.queryByTestId('adaptive-back')).toBeNull();
  });

  it('keeps the tab test IDs, labels and selected state', () => {
    const {screen} = renderRail(1);
    expect(screen.getByTestId('tab-decklists').props.accessibilityState).toEqual({selected: true});
    expect(screen.getByTestId('tab-cards').props.accessibilityState).toEqual({selected: false});
    expect(screen.getByLabelText('Search')).toBeTruthy();
    expect(screen.getByLabelText('Rules')).toBeTruthy();
  });

  it('navigates to another tab, and not to the focused one', () => {
    const {screen, navigation} = renderRail(1);
    fireEvent.press(screen.getByTestId('tab-rules'));
    expect(navigation.navigate).toHaveBeenCalledWith('Rules', undefined);
    navigation.navigate.mockClear();
    fireEvent.press(screen.getByTestId('tab-decklists'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});

describe('room for the system status items in the strip', () => {
  const {stripStatusRoom} = require('../ControlRail');
  it('clears the time and connectivity the system draws in the strip', () => {
    expect(stripStatusRoom(678)).toBeGreaterThanOrEqual(160); // closed, upright
    expect(stripStatusRoom(669)).toBeGreaterThanOrEqual(160); // open, landscape
  });
  it('keeps only the island clearance where iOS hides the status bar (compact height)', () => {
    expect(stripStatusRoom(466)).toBeLessThan(60); // closed, landscape
  });
});

describe('the strip is transparent', () => {
  it('paints nothing of its own and lets touches between controls through', () => {
    const {screen} = renderRail();
    const rail = screen.getByTestId('control-rail');
    const style = Object.assign({}, ...[rail.props.style].flat());
    expect(style.backgroundColor).toBeUndefined();
    expect(style.borderLeftWidth ?? 0).toBe(0);
    expect(style.borderRightWidth ?? 0).toBe(0);
    expect(rail.props.pointerEvents).toBe('box-none');
    expect(screen.UNSAFE_queryAllByProps({blurType: expect.anything()})).toHaveLength(0);
  });
});

