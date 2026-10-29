/* Jest factories require local imports because their declarations are hoisted. */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import SearchableCardList from '../../cards/SearchableCardList';
import DecklistsScreen from '../../decklists/DecklistsScreen';
import AllCardsContext from '../../../contexts/AllCardsContext';
import AllDecklistsContext from '../../../contexts/AllDecklistsContext';

let mockHeaderOptions;
const mockNavigation = {setOptions: options => {mockHeaderOptions = options;}};
jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn(), useNavigation: () => mockNavigation}));
const pressHeader = (name: 'headerRight' | 'headerLeft') => {
  act(() => mockHeaderOptions[name]().props.onPress());
};
jest.mock('@react-navigation/elements', () => ({useHeaderHeight: () => 103}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 83,
}));
jest.mock('../../cards/CardSearchFooter', () => (props: any) => {
  const {TextInput} = require('react-native');
  return (
    <TextInput
      testID="search-input"
      value={props.query}
      onChangeText={props.searchCallback}
    />
  );
});
jest.mock('../../decklists/DecklistSearchFooter', () => (props: any) => {
  const {TextInput} = require('react-native');
  return (
    <TextInput
      testID="search-input"
      value={props.query}
      onChangeText={props.searchCallback}
    />
  );
});
const cards = [
  {
    id: 'luke',
    title: 'Luke Skywalker',
    type: 'Character',
    subtype: 'Rebel',
    imageUrl: 'luke.gif',
    backImageUrl: '',
    sortTitle: 'luke skywalker',
    expansionSet: {name: 'Premiere'},
  },
] as any;
const resize = (screen: ReturnType<typeof render>, width: number) =>
  fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', {
    nativeEvent: {layout: {width, height: 600}},
  });

it('keeps card search and selected artwork across compact/wide changes and Back', () => {
  const screen = render(
    <AllCardsContext.Provider value={cards}>
      <SearchableCardList cards={cards} />
    </AllCardsContext.Provider>,
  );
  resize(screen, 951);
  fireEvent.changeText(screen.getByTestId('search-input'), 'luke');
  fireEvent.press(screen.getByTestId('card-item-0'));
  expect(screen.getByTestId('card-detail-artwork').props.source.uri).toBe(
    'luke.gif',
  );
  resize(screen, 375);
  expect(screen.queryByTestId('search-input')).toBeNull();
  resize(screen, 951);
  expect(screen.getByTestId('search-input').props.value).toBe('luke');
  resize(screen, 375);
  fireEvent.press(screen.getByTestId('adaptive-back'));
  expect(screen.getByTestId('search-input').props.value).toBe('luke');
  fireEvent.changeText(screen.getByTestId('search-input'), 'unmatched');
  expect(screen.getByText('No results found')).toBeTruthy();
});

it('keeps filtered deck browsing visible while replacing selected details', () => {
  const decks = ['First', 'Second'].map((title, index) => ({
    slug: String(index),
    title,
    archetype: {name: title},
    cards: [],
    plaintext: `${title} deck text`,
    player: {name: 'Lee'},
    searchData: () => `lee ${title.toLowerCase()}`,
  })) as any;
  const screen = render(
    <AllDecklistsContext.Provider value={decks}>
      <DecklistsScreen />
    </AllDecklistsContext.Provider>,
  );
  resize(screen, 951);
  fireEvent.changeText(screen.getByTestId('search-input'), 'lee');
  fireEvent.press(screen.getByTestId('decklist-row-0'));
  pressHeader('headerRight');
  pressHeader('headerRight');
  expect(screen.getByText('Second deck text')).toBeTruthy();
  fireEvent.press(screen.getByTestId('decklist-row-1'));
  expect(screen.getByTestId('deck-grid')).toBeTruthy();
  expect(screen.getByTestId('search-input').props.value).toBe('lee');
  resize(screen, 375);
  pressHeader('headerLeft');
  expect(screen.getByTestId('search-input').props.value).toBe('lee');
});

jest.mock('react-native-elements', () => {
  const React = require('react');
  const {Pressable, Text, View} = require('react-native');
  const ListItem = ({children, onPress, testID}) => <Pressable testID={testID} onPress={onPress}>{children}</Pressable>;
  ListItem.Content = View;
  ListItem.Title = Text;
  ListItem.Subtitle = Text;
  return {ListItem, Icon: () => null};
});

jest.mock('../../decklists/DecklistsScreenGridView', () => () => {
  const {View} = require('react-native');
  return <View testID="deck-grid" />;
});
jest.mock('../../decklists/DecklistsScreenListView', () => () => null);
jest.mock('../../decklists/DecklistsScreenTextView', () => ({route}) => {
  const {Text} = require('react-native');
  return <Text>{route.params.decklist.plaintext}</Text>;
});

it('dismisses the selected card when the search is cleared', () => {
  const screen = render(
    <AllCardsContext.Provider value={cards}>
      <SearchableCardList cards={cards} />
    </AllCardsContext.Provider>,
  );
  resize(screen, 951);
  fireEvent.changeText(screen.getByTestId('search-input'), 'luke');
  fireEvent.press(screen.getByTestId('card-item-0'));
  expect(screen.getByTestId('card-detail')).toBeTruthy();

  fireEvent.changeText(screen.getByTestId('search-input'), '');
  expect(screen.queryByTestId('card-detail')).toBeNull();
  expect(screen.getByText('Select a card')).toBeTruthy();
});

it('keeps the card while the search still has text', () => {
  const screen = render(
    <AllCardsContext.Provider value={cards}>
      <SearchableCardList cards={cards} />
    </AllCardsContext.Provider>,
  );
  resize(screen, 951);
  fireEvent.changeText(screen.getByTestId('search-input'), 'luke');
  fireEvent.press(screen.getByTestId('card-item-0'));
  fireEvent.changeText(screen.getByTestId('search-input'), 'luk');
  expect(screen.getByTestId('card-detail')).toBeTruthy();
});
