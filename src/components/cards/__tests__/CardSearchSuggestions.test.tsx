import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import SearchableCardList from '../SearchableCardList';
import AllCardsContext from '../../../contexts/AllCardsContext';

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('@react-navigation/elements', () => ({useHeaderHeight: () => 103}));
jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => 83}));
jest.mock('react-native-elements', () => ({
  Text: require('react-native').Text,
  Icon: () => null,
  Chip: () => null,
}));
jest.mock('../CardListItem', () => ({item}: any) => {
  const {Text} = require('react-native');
  return <Text testID={`result-${item.id}`}>{item.displayTitle}</Text>;
});

it('runs a suggested title through the real search field and supports editing and clearing it', () => {
  const cards = [
    {id: 'farm', title: 'Moisture Farm', sortTitle: 'moisture farm', type: 'Location', imageUrl: '', backImageUrl: '', expansionSet: {name: 'Premiere'}},
    {id: 'ship', title: 'Chimaera', sortTitle: 'chimaera', type: 'Starship', imageUrl: '', backImageUrl: '', expansionSet: {name: 'Premiere'}},
  ] as any;
  const screen = render(<AllCardsContext.Provider value={cards}>
    <SearchableCardList cards={cards} />
  </AllCardsContext.Provider>);
  fireEvent.press(screen.getByRole('button', {name: 'Search for farm'}));
  expect(screen.getByTestId('cards-search-input').props.value).toBe('farm');
  expect(screen.getByTestId('result-farm')).toBeTruthy();
  expect(screen.queryByTestId('result-ship')).toBeNull();
  fireEvent.changeText(screen.getByTestId('cards-search-input'), 'chimaera');
  expect(screen.getByTestId('result-ship')).toBeTruthy();
  expect(screen.queryByTestId('result-farm')).toBeNull();
  fireEvent.press(screen.getByTestId('cards-search-input-clear'));
  expect(screen.getByTestId('cards-search-input').props.value).toBe('');
  expect(screen.getByRole('button', {name: 'Search for farm'})).toBeTruthy();
});
