import React from 'react';
import {render} from '@testing-library/react-native';
import AdaptiveDeckDetail from '../../decklists/AdaptiveDeckDetail';
import DecklistPresenter from '../../../presenters/DecklistPresenter';
jest.mock('../../decklists/DecklistsScreenGridView', () => 'OriginalGrid');
jest.mock('../../decklists/DecklistsScreenListView', () => 'OriginalList');
jest.mock('../../decklists/DecklistsScreenTextView', () => 'OriginalText');
const deck = {slug: 'one'} as DecklistPresenter;
it('uses the original views without adding a second toolbar or word tabs', () => {
  const screen = render(<AdaptiveDeckDetail deck={deck} />);
  expect(screen.UNSAFE_queryAllByType('OriginalGrid')).toHaveLength(1);
  expect(screen.queryByText('Grid')).toBeNull();
  expect(screen.queryByText('List')).toBeNull();
  expect(screen.queryByText('Text')).toBeNull();
  screen.rerender(<AdaptiveDeckDetail deck={deck} mode="list" />);
  expect(screen.UNSAFE_queryAllByType('OriginalList')).toHaveLength(1);
  screen.rerender(<AdaptiveDeckDetail deck={deck} mode="text" />);
  expect(screen.UNSAFE_queryAllByType('OriginalText')).toHaveLength(1);
});
