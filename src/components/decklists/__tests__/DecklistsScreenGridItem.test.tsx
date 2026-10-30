import React from 'react';
import {render} from '@testing-library/react-native';
import DecklistsScreenGridItem from '../DecklistsScreenGridItem';

jest.mock('@react-navigation/native', () => ({useNavigation: () => ({setOptions: jest.fn()})}));
jest.mock('react-native-fast-image', () => {
  const {View} = require('react-native');
  const FastImage = (props: any) => <View {...props} />;
  FastImage.resizeMode = {contain: 'contain', cover: 'cover'};
  return {__esModule: true, default: FastImage};
});

const props = {
  item: {title: 'Luke Skywalker', type: 'Character', aspectRatio: 0.7, imageUrl: 'luke.gif'},
  decklist: {displaySubtitle: 'Worlds', side: 'Light'},
  index: 0,
  scrollViewRef: {current: null},
  cardsPerRow: 4,
  isExpanded: false,
  showingBackSide: false,
};

describe('DecklistsScreenGridItem', () => {
  it('renders at zero width (a pane hidden while iPhone Duo opens or closes)', () => {
    // Closing the phone with a deck open crashed: 0/0 scale gave a NaN
    // interpolation range ("inputRange must be monotonically non-decreasing").
    expect(() => render(<DecklistsScreenGridItem {...props} windowWidth={0} />)).not.toThrow();
  });

  it('renders at a real width', () => {
    expect(() => render(<DecklistsScreenGridItem {...props} windowWidth={382} />)).not.toThrow();
  });
});
