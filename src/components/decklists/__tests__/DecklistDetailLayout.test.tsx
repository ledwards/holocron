import React from 'react';
import {render} from '@testing-library/react-native';
import {ScrollView, StyleSheet} from 'react-native';
import DecklistsScreenGridView from '../DecklistsScreenGridView';
import DecklistsScreenTextView from '../DecklistsScreenTextView';
import ThemeContext from '../../../contexts/ThemeContext';
import themeLight from '../../../styles/themeLight';

let mockHeaderHeight = 103;
let mockTabHeight = 83;
jest.mock('@react-navigation/elements', () => ({useHeaderHeight: () => mockHeaderHeight}));
jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => mockTabHeight}));
jest.mock('../DecklistsScreenGridItem', () => () => null);

describe('deck detail safe-area layout', () => {
  it.each([[103, 83], [44, 53]])('keeps grid and text outside %s-point header / %s-point tabs', (header, tabs) => {
    mockHeaderHeight = header;
    mockTabHeight = tabs;
    for (const Component of [DecklistsScreenGridView, DecklistsScreenTextView]) {
      const {UNSAFE_getByType, unmount} = render(
        <ThemeContext.Provider value={themeLight}>
          <Component route={{params: {decklist: {cards: [], displayTitle: 'Deck', displaySubtitle: 'Event', plaintext: 'Cards'}}} as any} navigation={{}} />
        </ThemeContext.Provider>,
      );
      const content = StyleSheet.flatten(UNSAFE_getByType(ScrollView).props.contentContainerStyle);
      expect(content.paddingTop).toBeGreaterThanOrEqual(header);
      expect(content.paddingBottom).toBeGreaterThanOrEqual(tabs);
      unmount();
    }
  });
});
