import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RulesScreen from '../components/rules/RulesScreen';
import {RulesDocument, RulesSearchIndex} from '../lib/rules/types';

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
        {type: 'paragraph', textRuns: [{text: 'Welcome text'}]},
      ],
    },
    {
      id: 'actions',
      title: 'Actions',
      level: 1,
      anchor: 'actions',
      pageRef: 2,
      blocks: [
        {type: 'heading', textRuns: [{text: 'Actions'}]},
        {type: 'paragraph', textRuns: [{text: 'Take actions during your turn.'}]},
      ],
    },
  ],
  toc: [
    {title: 'Introduction', anchor: 'introduction', level: 1, order: 0},
    {title: 'Actions', anchor: 'actions', level: 1, order: 1},
  ],
};

const indexFixture: RulesSearchIndex = {
  version: '1',
  tokenMap: {
    actions: [
      {sectionId: 'actions', sectionIndex: 1, blockIndex: 1, tokenPosition: 1},
    ],
  },
};

describe('Rules flow e2e', () => {
  it('filters rules and supports toc panel interactions', () => {
    const {getByTestId, queryByText} = render(
      <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />,
    );

    fireEvent.changeText(getByTestId('rules-search-input'), 'actions');
    fireEvent.press(getByTestId('rules-submit-search'));
    expect(queryByText('Introduction')).toBeNull();
    expect(queryByText('Actions')).toBeTruthy();

    fireEvent.press(getByTestId('rules-toc-toggle'));
    expect(getByTestId('rules-toc-panel')).toBeTruthy();
    fireEvent.press(getByTestId('rules-toc-item-1'));
  });
});
