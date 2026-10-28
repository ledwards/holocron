/**
 * jest.setup.js fails any test that makes React warn about list keys. This
 * proves the guard fires on the bug it exists for: two cards with the same
 * gempId in the card list (2026-10-27, upstream "(ALT)" rows). If this test
 * fails, the guard has stopped catching duplicate keys.
 */
import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import SearchableCardList from '../SearchableCardList';
import AllCardsContext from '../../../contexts/AllCardsContext';
import Card from '../../../models/Card';

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('@react-navigation/elements', () => ({useHeaderHeight: () => 103}));
jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => 83}));
jest.mock('react-native-elements', () => ({
  Text: require('react-native').Text,
  Icon: () => null,
  Chip: () => null,
}));
jest.mock('../CardListItem', () => ({item}: {item: {displayTitle: string}}) => {
  const {Text} = require('react-native');
  return <Text>{item.displayTitle}</Text>;
});

const virtual0 = {id: '200', name: 'Virtual Set 0', abbr: 'V0', gempName: 'Set 0'};
const row = (title: string) => new Card({
  gempId: '200_109', side: 'Dark', set: '200', rarity: 'U2',
  front: {title, type: 'Effect', subType: '', characteristics: [], icons: [], imageUrl: ''},
} as never, virtual0);

const keyWarnings = (global as unknown as {__keyWarnings: string[]}).__keyWarnings;

it('fails a test when the card list renders two rows with the same key', () => {
  // the exact upstream pair that reached the app before the loader fix
  const cards = [row('•Coarse And Rough And Irritating'), row('•Coarse And Rough And Irritating (ALT)')];
  const screen = render(<AllCardsContext.Provider value={cards}>
    <SearchableCardList cards={cards} />
  </AllCardsContext.Provider>);

  fireEvent.changeText(screen.getByTestId('cards-search-input'), 'coarse');

  // Consume the warnings so this test passes; anywhere else they fail it.
  const found = keyWarnings.splice(0);
  expect(found.some(w => w.includes('same key'))).toBe(true);
});
