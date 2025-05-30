import React from 'react';
import { render } from '@testing-library/react-native';
import DecklistListItem from '../DecklistListItem';
import { Theme } from '../../../types/interfaces';

// Mock the dependencies
jest.mock('react-native-elements', () => ({
  ListItem: {
    Content: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Title: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Subtitle: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

jest.mock('react-native-fast-image', () => {
  return {
    __esModule: true,
    default: 'FastImage',
    resizeMode: {
      cover: 'cover',
    },
  };
});

describe('DecklistListItem', () => {
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

  const mockDecklistItem = {
    sideways: false,
    aspectRatio: 1.4,
    imageUrl: 'https://example.com/decklist.jpg',
    side: 'Light',
    offsetY: 0,
    displayTitle: 'Test Decklist',
    displaySubtitle: 'Test Tournament • 2023-05-15',
  };

  it('renders correctly with light side decklist', () => {
    const { getByText } = render(
      <DecklistListItem
        theme={mockTheme}
        item={mockDecklistItem}
        index={0}
      />
    );

    expect(getByText('Test Decklist')).toBeTruthy();
    expect(getByText('Test Tournament • 2023-05-15')).toBeTruthy();
  });

  it('renders correctly with dark side decklist', () => {
    const darkSideDecklistItem = {
      ...mockDecklistItem,
      side: 'Dark',
    };

    const { getByText } = render(
      <DecklistListItem
        theme={mockTheme}
        item={darkSideDecklistItem}
        index={0}
      />
    );

    expect(getByText('Test Decklist')).toBeTruthy();
    expect(getByText('Test Tournament • 2023-05-15')).toBeTruthy();
  });

  it('handles sideways decklists', () => {
    const sidewaysDecklistItem = {
      ...mockDecklistItem,
      sideways: true,
      aspectRatio: 0.7,
    };

    const { getByText } = render(
      <DecklistListItem
        theme={mockTheme}
        item={sidewaysDecklistItem}
        index={0}
      />
    );

    expect(getByText('Test Decklist')).toBeTruthy();
  });

  it('renders with null theme', () => {
    const { getByText } = render(
      <DecklistListItem
        theme={null}
        item={mockDecklistItem}
        index={0}
      />
    );

    expect(getByText('Test Decklist')).toBeTruthy();
  });
});