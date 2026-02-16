import React from 'react';
import {render} from '@testing-library/react-native';
import {Text} from 'react-native';
import DecklistListItem from '../DecklistListItem';
import {Theme} from '../../../types/interfaces';

jest.mock('react-native-elements', () => {
  const {Pressable, Text: RNText, View: RNView} = require('react-native');

  const ListItem = ({children}: any) => <Pressable>{children}</Pressable>;
  ListItem.Content = ({children}: any) => <RNView>{children}</RNView>;
  ListItem.Title = ({children}: any) => <RNText>{children}</RNText>;
  ListItem.Subtitle = ({children}: any) => <RNText>{children}</RNText>;

  return {ListItem};
});

jest.mock('react-native-fast-image', () => {
  const {View: RNView} = require('react-native');
  const FastImageMock = ({children}: any) => <RNView>{children}</RNView>;
  FastImageMock.resizeMode = {cover: 'cover'};
  return {
    __esModule: true,
    default: FastImageMock,
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

  it('renders title and subtitle', () => {
    const {getByText} = render(
      <DecklistListItem theme={mockTheme} item={mockDecklistItem} index={0} />,
    );

    expect(getByText('Test Decklist')).toBeTruthy();
    expect(getByText('Test Tournament • 2023-05-15')).toBeTruthy();
  });

  it('renders with null theme', () => {
    const {getByText} = render(
      <DecklistListItem theme={null} item={mockDecklistItem} index={0} />,
    );

    expect(getByText('Test Decklist')).toBeTruthy();
  });
});
