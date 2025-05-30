import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CardListItem from '../CardListItem';
import { CardSide } from '../../../types/enums';
import { Theme } from '../../../types/interfaces';

// Mock the dependencies
jest.mock('react-native-elements', () => ({
  ListItem: {
    Content: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Title: ({ children, style }: { children: React.ReactNode, style: any }) => 
      <div testID="list-item-title" style={style}>{children}</div>,
    Subtitle: ({ children, style }: { children: React.ReactNode, style: any }) => 
      <div testID="list-item-subtitle" style={style}>{children}</div>,
  },
}));

jest.mock('react-native-fast-image', () => {
  return {
    __esModule: true,
    default: ({ source, style }: { source: any, style: any }) => (
      <div testID="fast-image" style={style} data-source={source.uri}></div>
    ),
    resizeMode: {
      cover: 'cover',
    },
  };
});

jest.mock('@react-native-community/blur', () => ({
  BlurView: ({ children, style }: { children: React.ReactNode, style: any }) => (
    <div testID="blur-view" style={style}>{children}</div>
  ),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      View: ({ children, style, ...props }: { children: React.ReactNode, style: any }) => (
        <div style={style} {...props}>{children}</div>
      ),
      timing: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
      sequence: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
      parallel: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
      Value: jest.fn((value) => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({})),
        value
      })),
    },
    Easing: {
      elastic: jest.fn(() => 'elastic'),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375 })),
    },
    Keyboard: {
      dismiss: jest.fn(),
    },
  };
});

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
  const mockFlatListRef = {};

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with light side card', () => {
    const { getByTestId } = render(
      <CardListItem
        item={mockCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
      />
    );

    const title = getByTestId('list-item-title');
    const subtitle = getByTestId('list-item-subtitle');
    
    expect(title.props.children).toBe('Test Card');
    expect(subtitle.props.children).toBe('Test Set • Character • R');
  });

  it('renders correctly with dark side card', () => {
    const darkSideCardItem = {
      ...mockCardItem,
      side: CardSide.Dark,
    };

    const { getByTestId } = render(
      <CardListItem
        item={darkSideCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
      />
    );

    const title = getByTestId('list-item-title');
    expect(title.props.children).toBe('Test Card');
  });

  it('handles card quantity display', () => {
    const { queryByText } = render(
      <CardListItem
        item={mockCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
        quantity={2}
      />
    );

    expect(queryByText('2')).toBeTruthy();
  });

  it('calls scrollToIndex when pressed', () => {
    const { getByTestId } = render(
      <CardListItem
        item={mockCardItem}
        index={3}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
      />
    );

    fireEvent.press(getByTestId('card-item-3'));
    expect(mockScrollToIndex).toHaveBeenCalledWith(3);
  });

  it('handles long titles with line breaks', () => {
    const longTitleCardItem = {
      ...mockCardItem,
      displayTitle: 'Test Card\nWith Line Break',
    };

    const { getByTestId } = render(
      <CardListItem
        item={longTitleCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
      />
    );

    const title = getByTestId('list-item-title');
    expect(title.props.children).toBe('Test Card\nWith Line Break');
  });

  it('handles sideways cards with different aspect ratios', () => {
    const sidewaysCardItem = {
      ...mockCardItem,
      sideways: true,
      aspectRatio: 0.7,
    };

    const { getByTestId } = render(
      <CardListItem
        item={sidewaysCardItem}
        index={0}
        scrollToIndex={mockScrollToIndex}
        flatListRef={mockFlatListRef}
        theme={mockTheme}
      />
    );

    const title = getByTestId('list-item-title');
    expect(title.props.children).toBe('Test Card');
  });
});