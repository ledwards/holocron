import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import SearchableCardList from '../SearchableCardList';
import AllCardsContext from '../../../contexts/AllCardsContext';
import Card from '../../../models/Card';
import Filter from '../../../models/Filter';
import fixture from '../../../data/__fixtures__/query-audit.json';

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('@react-navigation/elements', () => ({useHeaderHeight: () => 103}));
jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => 83}));
jest.mock('react-native-elements', () => ({
  Text: require('react-native').Text,
  Icon: () => null,
  Chip: ({title}: {title: string}) => {
    const {Text} = require('react-native');
    return <Text testID="chip">{title}</Text>;
  },
}));
jest.mock('../CardListItem', () => ({item}: {item: {id: string; displayTitle: string}}) => {
  const {Text} = require('react-native');
  return <Text testID={`result-${item.id}`}>{item.displayTitle}</Text>;
});

const makeCards = (): Card[] => fixture.cards.map(
  (c: {set: string}) => new Card(c as never, fixture.sets.find((s: {id: string}) => s.id === c.set) as never),
);

const setup = () => {
  const cards = makeCards(); // a new list: empty caches
  const screen = render(<AllCardsContext.Provider value={cards}>
    <SearchableCardList cards={cards} />
  </AllCardsContext.Provider>);
  const input = () => screen.getByTestId('cards-search-input');
  const shown = () => screen.queryAllByTestId(/^result-/).map(n => n.props.testID.slice(7)).sort();
  const naturalLanguage = () => fireEvent.press(screen.getByTestId('cards-search-mode-toggle'));
  return {screen, input, shown, naturalLanguage};
};

afterEach(() => jest.restoreAllMocks());

describe('the search box keeps what was typed', () => {
  it('shows mixed case as typed in title mode, and matches regardless of case', () => {
    const {input, shown} = setup();
    fireEvent.changeText(input(), 'Millennium Falcon');
    expect(input().props.value).toBe('Millennium Falcon');
    expect(shown()).toEqual(['1_143']);
  });

  it('shows mixed case as typed in query mode, and matches regardless of case', () => {
    const {input, shown, naturalLanguage} = setup();
    naturalLanguage();
    fireEvent.changeText(input(), 'Set C Premiere and Type C Starship');
    expect(input().props.value).toBe('Set C Premiere and Type C Starship');
    expect(shown()).toEqual(['1_143', '1_301']);
  });
});

describe('the status bar does not repeat the search', () => {
  // Every Filter.execute call during one keystroke, as field|comparator|value|compact.
  const recordFilterRuns = () => {
    const runs: string[] = [];
    const original = Filter.prototype.execute;
    jest.spyOn(Filter.prototype, 'execute').mockImplementation(function (this: Filter, cards, compact = false) {
      runs.push(`${this.field.name}|${this.comparator.name}|${this.value}|${compact}`);
      return original.call(this, cards, compact);
    });
    return runs;
  };

  it('runs each filter at most once per keystroke, status bar counts included', () => {
    const {input, naturalLanguage, screen} = setup();
    naturalLanguage();
    const runs = recordFilterRuns();
    fireEvent.changeText(input(), 'side = dark and power > 5 and type c starship');
    expect(screen.getByText('(combined 2 results)')).toBeTruthy(); // the status bar rendered its counts
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.length).toBe(new Set(runs).size);
  });

  it('runs no filters when the same query is entered again', () => {
    const {input, naturalLanguage} = setup();
    naturalLanguage();
    fireEvent.changeText(input(), 'setcpremiereandtypecstarship');
    const runs = recordFilterRuns();
    fireEvent.changeText(input(), 'setcpremiereandtypecstarship');
    expect(runs).toEqual([]);
  });
});
