import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Animated} from 'react-native';
import CardListItem from '../CardListItem';
import {CardSide} from '../../../types/enums';
import {Theme} from '../../../types/interfaces';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');
  const {Pressable, Text: RNText, View: RNView} = require('react-native');

  const ListItem = ({children, onPress, testID}: any) => (
    <Pressable onPress={onPress} testID={testID}>
      {children}
    </Pressable>
  );

  ListItem.Content = ({children}: any) => <RNView>{children}</RNView>;
  ListItem.Title = ({children}: any) => <RNText>{children}</RNText>;
  ListItem.Subtitle = ({children}: any) => <RNText>{children}</RNText>;

  return {ListItem};
});

jest.mock('react-native-fast-image', () => {
  const {View: RNView} = require('react-native');
  const FastImageMock = (props: any) => <RNView {...props} testID="original-row-art" />;
  FastImageMock.resizeMode = {cover: 'cover'};
  return {
    __esModule: true,
    default: FastImageMock,
  };
});

jest.mock('@react-native-community/blur', () => ({
  BlurView: ({children}: any) => {
    const {View: RNView} = require('react-native');
    return <RNView>{children}</RNView>;
  },
}));

describe('CardListItem', () => {
  const mockTheme: Theme = {
    name: 'light',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    secondaryColor: '#F5F5F5',
    dividerColor: '#EEEEEE',
    primaryButtonColor: '#007AFF',
    disabledButtonColor: '#CCCCCC',
    translucentBackgroundColor: 'rgba(255,255,255,0.8)',
    statusBarStyle: 'dark-content',
  };

  const mockCardItem = {
    sideways: false,
    aspectRatio: 1.4,
    displayImageUrl: 'https://example.com/card.jpg',
    displayBackImageUrl: 'https://example.com/card-back.jpg',
    displayTitle: 'Test Card',
    displayExpansionSet: 'Test Set',
    type: 'Character',
    rarity: 'R',
    side: CardSide.Light,
    twoSided: true,
    offsetY: 0,
  };

  const mockScrollToIndex = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and subtitle', () => {
    const {getByText} = render(
      <CardListItem
        item={mockCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        theme={mockTheme}
      />,
    );

    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Test Set • Character • R')).toBeTruthy();
  });

  it('calls scrollToIndex when pressed', () => {
    const {getByTestId} = render(
      <CardListItem
        item={mockCardItem}
        index={3}
        scrollToIndex={mockScrollToIndex}
        theme={mockTheme}
      />,
    );

    fireEvent.press(getByTestId('card-item-3'));
    expect(mockScrollToIndex).toHaveBeenCalledWith(3);
  });

  it('renders quantity badge text when quantity is provided', () => {
    const {getByText} = render(
      <CardListItem
        item={mockCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        theme={mockTheme}
        quantity={2}
      />,
    );

    expect(getByText('2')).toBeTruthy();
  });
  it('preserves the cover crop and presenter offset when opening a detail pane', () => {
    const onPress = jest.fn();
    const screen = render(<CardListItem item={{...mockCardItem, offsetY: -30}}
      index={0} scrollToIndex={mockScrollToIndex} onPress={onPress} />);
    const art = screen.getByTestId('original-row-art');
    expect(art.props.resizeMode).toBe('cover');
    expect(art.props.style).toMatchObject({left: -30, position: 'relative'});
    expect(screen.UNSAFE_getAllByType(Animated.View).some(node =>
      node.props.style?.right === -60 && node.props.style?.top === -30)).toBe(true);
    fireEvent.press(screen.getByTestId('card-item-0'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockScrollToIndex).not.toHaveBeenCalled();
    expect(screen.getByText('Test Set • Character • R')).toBeTruthy();
  });

  it('settles on its pane width instead of re-measuring sub-point changes', () => {
    const screen = render(<CardListItem item={mockCardItem} index={0}
      scrollToIndex={mockScrollToIndex} theme={mockTheme} />);
    const row = screen.UNSAFE_getAllByType(Animated.View)[0];
    const layout = (width: number) => fireEvent(row, 'layout',
      {nativeEvent: {layout: {width, height: 100, x: 0, y: 0}}});
    const artWidth = () => screen.UNSAFE_getAllByType(Animated.View)[1]
      .props.style.width.__getValue();

    layout(400.2);
    expect(artWidth()).toBeCloseTo(400 * 0.55);
    layout(400.4);
    layout(399.8);
    expect(artWidth()).toBeCloseTo(400 * 0.55);
    expect(row.props.style.alignSelf).toBe('stretch');
  });

});
