import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import CardDetail from '../CardDetail';
import {cardCornerRadius} from '../CardArtwork';

jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => 0}));

const card = {id: 'vader', title: 'Darth Vader', subtitle: 'Premiere · Character', imageUrl: 'vader.gif'};
const flat = (node: {props: {style: unknown}}) => Object.assign({}, ...[node.props.style].flat());

describe('card detail', () => {
  it('shows only the card: no title, no set and type text', () => {
    const screen = render(<CardDetail card={card} />);
    expect(screen.queryByText('Darth Vader')).toBeNull();
    expect(screen.queryByText('Premiere · Character')).toBeNull();
    // The card stays labelled for VoiceOver.
    expect(screen.getByLabelText('Darth Vader, front')).toBeTruthy();
  });

  it('gives the card the whole pane apart from a small margin', () => {
    const screen = render(<CardDetail card={card} />);
    fireEvent(screen.getByTestId('card-detail'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 600, height: 800}}});
    const image = flat(screen.getByTestId('card-detail-artwork'));
    // 600x800 pane, 10-point margin: the 339x475 card is limited by height.
    expect(image.height).toBeCloseTo(780, 0);
    expect(image.width).toBeCloseTo((780 / 475) * 339, 0);
  });

  it('rounds the card corners', () => {
    const screen = render(<CardDetail card={card} />);
    fireEvent(screen.getByTestId('card-detail'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 600, height: 800}}});
    const image = flat(screen.getByTestId('card-detail-artwork'));
    expect(image.borderRadius).toBe(cardCornerRadius(image.width, image.height));
    expect(image.borderRadius).toBeGreaterThan(10);
  });
});

describe('cardCornerRadius', () => {
  it('is about 5% of the short side, either way up', () => {
    expect(cardCornerRadius(339, 475)).toBe(17);
    expect(cardCornerRadius(475, 339)).toBe(17);
  });
});
