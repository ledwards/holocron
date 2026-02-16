import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RulesToc from '../RulesToc';
import {Theme} from '../../../types/interfaces';

const theme: Theme = {
  name: 'dark',
  backgroundColor: '#000',
  foregroundColor: '#fff',
  dividerColor: '#333',
  translucentBackgroundColor: 'rgba(0,0,0,0.5)',
};

describe('RulesToc', () => {
  it('emits selected anchor when toc entry is pressed', () => {
    const onAnchorPress = jest.fn();
    const onToggleCollapsed = jest.fn();
    const onClose = jest.fn();
    const {getByTestId} = render(
      <RulesToc
        entries={[
          {title: 'Intro', anchor: 'intro', level: 1, order: 0},
          {title: 'Timing', anchor: 'timing', level: 1, order: 1},
        ]}
        onAnchorPress={onAnchorPress}
        theme={theme}
        collapsedAnchors={new Set()}
        onToggleCollapsed={onToggleCollapsed}
        onClose={onClose}
      />,
    );

    fireEvent.press(getByTestId('rules-toc-item-1'));
    expect(onAnchorPress).toHaveBeenCalledWith('timing');
  });
});
