import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import SearchableCardList from '../SearchableCardList';
import AllCardsContext from '../../../contexts/AllCardsContext';
import Card from '../../../models/Card';
import fixture from '../../../data/__fixtures__/query-audit.json';

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

const cards: Card[] = fixture.cards.map(
  (c: {set: string}) => new Card(c as any, fixture.sets.find((s: {id: string}) => s.id === c.set)),
);

const shown = (screen: ReturnType<typeof render>) =>
  screen.queryAllByTestId(/^result-/).map(n => n.props.testID.replace('result-', '')).sort();

it('finds cards from queries typed without the space bar, in both search modes', () => {
  const screen = render(<AllCardsContext.Provider value={cards}>
    <SearchableCardList cards={cards} />
  </AllCardsContext.Provider>);
  const input = () => screen.getByTestId('cards-search-input');

  // title mode
  fireEvent.changeText(input(), 'millenniumfalcon');
  expect(shown(screen)).toEqual(['1_143']);

  // natural-language mode, the query from the bug report
  fireEvent.press(screen.getByTestId('cards-search-mode-toggle'));
  fireEvent.changeText(input(), 'setcpremiereandtypecstarship');
  expect(shown(screen)).toEqual(['1_143', '1_301']);
  fireEvent.changeText(input(), 'power>=6');
  expect(shown(screen)).toEqual(['1_168', '1_301', '211_23']);
});
