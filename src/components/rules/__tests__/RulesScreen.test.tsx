import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RulesScreen from '../RulesScreen';
import {RulesDocument, RulesSearchIndex} from '../../../lib/rules/types';

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 58,
}));

const documentFixture: RulesDocument = {
  version: '1',
  sourceUrl: 'https://example.com/rules.pdf',
  sourceSha256: 'abc',
  generatedAt: '2026-01-01T00:00:00.000Z',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      level: 1,
      anchor: 'introduction',
      pageRef: 1,
      blocks: [
        {type: 'heading', textRuns: [{text: 'Introduction'}]},
        {type: 'paragraph', textRuns: [{text: 'Welcome to the rules.'}]},
      ],
    },
    {
      id: 'timing',
      title: 'Timing',
      level: 1,
      anchor: 'timing',
      pageRef: 2,
      blocks: [
        {type: 'heading', textRuns: [{text: 'Timing'}]},
        {type: 'paragraph', textRuns: [{text: 'Actions happen in windows.'}]},
      ],
    },
  ],
  toc: [
    {title: 'Introduction', anchor: 'introduction', level: 1, order: 0},
    {title: 'Timing', anchor: 'timing', level: 1, order: 1},
  ],
};

const indexFixture: RulesSearchIndex = {
  version: '1',
  tokenMap: {
    actions: [
      {sectionId: 'timing', sectionIndex: 1, blockIndex: 1, tokenPosition: 0},
    ],
  },
};

describe('RulesScreen', () => {
  it('filters sections from search input', () => {
    const {getByTestId, getByText, queryByText} = render(
      <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />,
    );

    fireEvent.changeText(getByTestId('rules-search-input'), 'actions');
    fireEvent.press(getByTestId('rules-submit-search'));
    expect(queryByText('Introduction')).toBeNull();
    expect(queryByText('Timing')).toBeTruthy();
    expect(getByText('Showing 1 of 2 sections • 1 hit')).toBeTruthy();
  });

  it('toggles toc and handles toc item press', () => {
    const {getByTestId, queryByTestId} = render(
      <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />,
    );

    fireEvent.press(getByTestId('rules-toc-toggle'));
    expect(getByTestId('rules-toc-panel')).toBeTruthy();
    fireEvent.press(getByTestId('rules-toc-item-1'));
    expect(queryByTestId('rules-toc-panel')).toBeNull();
  });

  it('shows an initial visible page label instead of fallback placeholder', () => {
    const {getByTestId} = render(
      <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />,
    );

    expect(getByTestId('rules-visible-pages').props.children).toBe('Page 1');
  });

  it('navigates query hits with next/prev controls', () => {
    const {getByTestId, getByText} = render(
      <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />,
    );

    fireEvent.changeText(getByTestId('rules-search-input'), 'actions');
    fireEvent.press(getByTestId('rules-submit-search'));
    expect(getByTestId('rules-hit-progress').props.children).toBe('0/1');

    fireEvent.press(getByTestId('rules-next-hit'));
    expect(getByTestId('rules-hit-progress').props.children).toBe('1/1');

    fireEvent.press(getByTestId('rules-prev-hit'));
    expect(getByTestId('rules-hit-progress').props.children).toBe('1/1');
    expect(getByText('Showing 1 of 2 sections • 1 hit')).toBeTruthy();
  });
});
