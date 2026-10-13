import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import SearchField from '../SearchField';

jest.mock('react-native-elements', () => ({Icon: () => null}));

describe('adaptive search field', () => {
  it('keeps typing, clearing, and changing mode accessible', () => {
    const change = jest.fn();
    const mode = jest.fn();
    const view = render(<SearchField testID="cards-search-input" value="agents"
      placeholder="Search by title" onChangeText={change} onModePress={mode} />);
    fireEvent.changeText(view.getByTestId('cards-search-input'), 'luke');
    expect(change).toHaveBeenLastCalledWith('luke');
    fireEvent.press(view.getByLabelText('Clear search'));
    expect(change).toHaveBeenLastCalledWith('');
    fireEvent.press(view.getByLabelText('Change search mode'));
    expect(mode).toHaveBeenCalledTimes(1);
    view.rerender(<SearchField testID="cards-search-input" value=""
      placeholder="Search by title" onChangeText={change} />);
    expect(view.queryByLabelText('Clear search')).toBeNull();
  });
});
