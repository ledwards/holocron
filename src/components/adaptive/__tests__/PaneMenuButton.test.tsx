import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import PaneMenuButton from '../PaneMenuButton';

jest.mock('react-native-elements', () => ({Icon: () => null}));
jest.mock('../AdaptiveWorkspace', () => {
  const {Pressable: Press} = require('react-native');
  return {PaneIconButton: ({testID, label, onPress}: any) => <Press testID={testID} accessibilityLabel={label} onPress={onPress} />};
});

const options = [
  {value: 'grid' as const, label: 'Grid', icon: 'grid-outline'},
  {value: 'list' as const, label: 'List', icon: 'list-outline'},
  {value: 'text' as const, label: 'Text', icon: 'document-text-outline'},
];

describe('PaneMenuButton', () => {
  it('opens a menu of every choice, checkmarks the selected one, and picks exactly one', () => {
    const onSelect = jest.fn();
    const screen = render(
      <PaneMenuButton testID="deck-mode-menu" label="Deck view" icon="ellipsis-horizontal-circle-outline"
        options={options} selected="list" onSelect={onSelect} />,
    );
    expect(screen.queryByTestId('deck-mode-menu-grid')).toBeNull();
    fireEvent.press(screen.getByTestId('deck-mode-menu'));
    expect(screen.getByTestId('deck-mode-menu-grid').props.accessibilityState.checked).toBe(false);
    expect(screen.getByTestId('deck-mode-menu-list').props.accessibilityState.checked).toBe(true);
    expect(screen.getByTestId('deck-mode-menu-text').props.accessibilityState.checked).toBe(false);
    fireEvent.press(screen.getByTestId('deck-mode-menu-text'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('text');
    expect(screen.queryByTestId('deck-mode-menu-grid')).toBeNull();
  });
});
