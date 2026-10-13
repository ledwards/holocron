import React from 'react';
import {render} from '@testing-library/react-native';
import CardsScreen from '../components/cards/CardsScreen';
import DecklistsScreenHome from '../components/decklists/DecklistsScreenHome';
import AllCardsContext from '../contexts/AllCardsContext';
import CardDataStatusContext from '../contexts/CardDataStatusContext';
import AllDecklistsContext from '../contexts/AllDecklistsContext';

const mockUseNavigation = jest.fn();
const mockSearchableCardList = jest.fn();
const mockSearchableDecklistList = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockUseNavigation(),
}));

jest.mock('../components/cards/SearchableCardList', () => (props: any) => {
  const {Text} = require('react-native');
  mockSearchableCardList(props);
  return <Text testID="searchable-card-list">Cards</Text>;
});

jest.mock('../components/decklists/SearchableDecklistList', () => (props: any) => {
  const {Text} = require('react-native');
  mockSearchableDecklistList(props);
  return <Text testID="searchable-decklist-list">Decklists</Text>;
});

describe('Basic flow e2e', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({navigate: jest.fn()});
  });

  it('shows card search list when cards are available', () => {
    const cards = [{id: '1', title: 'Luke'}] as any;

    const {getByTestId} = render(
      <AllCardsContext.Provider value={cards}>
        <CardsScreen />
      </AllCardsContext.Provider>,
    );

    expect(getByTestId('searchable-card-list')).toBeTruthy();
    expect(mockSearchableCardList).toHaveBeenCalledWith({cards});
  });

  it('hides card search list when there are no cards', () => {
    const {queryByTestId, getByText, queryByText} = render(
      <AllCardsContext.Provider value={[]}>
        <CardsScreen />
      </AllCardsContext.Provider>,
    );

    expect(queryByTestId('searchable-card-list')).toBeNull();
    expect(mockSearchableCardList).not.toHaveBeenCalled();
    expect(queryByTestId('cards-loading')).toBeTruthy();
    expect(getByText('Loading cards…')).toBeTruthy();
    expect(queryByText(/Connect to the internet/)).toBeNull();
  });

  it('shows an honest failure only after card loading has finished', () => {
    const screen = render(<CardDataStatusContext.Provider value="unavailable">
      <AllCardsContext.Provider value={[]}><CardsScreen /></AllCardsContext.Provider>
    </CardDataStatusContext.Provider>);
    expect(screen.queryByTestId('cards-loading')).toBeNull();
    expect(screen.getByText('Unable to load card data. Please reopen the app to try again.')).toBeTruthy();
    expect(screen.queryByText(/Connect to the internet/)).toBeNull();
  });

  it('shows decklist search list when decklists are available', () => {
    const decklists = [{timestamp: '2025-05-01T00:00:00Z'}] as any;

    const {getByTestId} = render(
      <AllDecklistsContext.Provider value={decklists}>
        <DecklistsScreenHome />
      </AllDecklistsContext.Provider>,
    );

    expect(getByTestId('searchable-decklist-list')).toBeTruthy();
    expect(mockSearchableDecklistList).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeHeaderHeight: 0,
        nativeFooterHeight: 0,
      }),
    );
  });
});
