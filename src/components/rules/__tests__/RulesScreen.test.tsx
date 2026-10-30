import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import RulesScreen from '../RulesScreen';
import DeviceLayoutContext, {defaultDeviceLayout} from '../../../contexts/DeviceLayoutContext';
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
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });
  const setup = () => render(<RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />);
  const search = (screen: ReturnType<typeof setup>, query = 'actions') => {
    fireEvent.press(screen.getByTestId('rules-open-search'));
    fireEvent.changeText(screen.getByTestId('rules-search-input'), query);
    act(() => jest.advanceTimersByTime(250));
  };

  it('starts with an unobstructed reader and page label', () => {
    const screen = setup();
    expect(screen.getByTestId('rules-document-scroll')).toBeTruthy();
    expect(screen.getByTestId('rules-visible-pages').props.children).toBe('Page 1');
    expect(screen.queryByTestId('rules-search-input')).toBeNull();
    expect(screen.queryByTestId('rules-match-bar')).toBeNull();
  });

  it('waits for typing to settle before searching the document', () => {
    const screen = setup();
    fireEvent.press(screen.getByTestId('rules-open-search'));
    fireEvent.changeText(screen.getByTestId('rules-search-input'), 'a');
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByTestId('rules-search-results-list')).toBeNull();
    fireEvent.changeText(screen.getByTestId('rules-search-input'), 'actions');
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByTestId('rules-search-results-list')).toBeNull();
    act(() => jest.advanceTimersByTime(50));
    expect(screen.getByTestId('rules-search-result-0')).toBeTruthy();
  });

  it('shows live results separately from the reader without duplicate action buttons', () => {
    const screen = setup();
    search(screen);
    expect(screen.getByText('1 matches')).toBeTruthy();
    expect(screen.getByTestId('rules-search-result-0')).toBeTruthy();
    expect(screen.queryByTestId('rules-document-scroll')).toBeNull();
    expect(screen.queryByTestId('rules-submit-search')).toBeNull();
    expect(screen.queryByTestId('rules-next-hit')).toBeNull();
  });

  it('opens a result, retains the full document, and returns to the same results', () => {
    const screen = setup();
    search(screen);
    fireEvent.press(screen.getByTestId('rules-search-result-0'));
    expect(screen.getByTestId('rules-document-scroll')).toBeTruthy();
    expect(screen.getByText('Welcome to the rules.')).toBeTruthy();
    expect(screen.getByTestId('rules-match-bar')).toBeTruthy();
    fireEvent.press(screen.getByTestId('rules-next-hit'));
    expect(screen.getByTestId('rules-hit-progress').props.children).toBe('1 of 1 pages');
    fireEvent.press(screen.getByTestId('rules-prev-hit'));
    expect(screen.getByTestId('rules-hit-progress').props.children).toBe('1 of 1 pages');
    fireEvent.press(screen.getByTestId('rules-open-search'));
    expect(screen.getByTestId('rules-search-input').props.value).toBe('actions');
  });

  it('clears search and recovers from empty results', () => {
    const screen = setup();
    search(screen, 'zzzz');
    expect(screen.getByText('No matching rules found.')).toBeTruthy();
    fireEvent.press(screen.getByTestId('rules-clear'));
    expect(screen.getByTestId('rules-search-input').props.value).toBe('');
    fireEvent.press(screen.getByTestId('rules-close-search'));
    expect(screen.queryByTestId('rules-match-bar')).toBeNull();
  });

  it('keeps all contents available while a search is active', () => {
    const screen = setup();
    search(screen);
    fireEvent.press(screen.getByTestId('rules-search-result-0'));
    fireEvent.press(screen.getByTestId('rules-toc-toggle'));
    expect(screen.getByTestId('rules-toc-item-0')).toBeTruthy();
    fireEvent.press(screen.getByTestId('rules-toc-item-1'));
    expect(screen.queryByTestId('rules-toc-panel')).toBeNull();
  });

  it('keeps query and selected reader across wide and compact layouts', () => {
    const screen = setup();
    const resize = (width: number) => fireEvent(screen.getByTestId('rules-workspace'), 'layout', {nativeEvent: {layout: {width}}});
    resize(951);
    fireEvent.changeText(screen.getByTestId('rules-wide-search-input'), 'actions');
    act(() => jest.advanceTimersByTime(250));
    fireEvent.press(screen.getByTestId('rules-wide-result-0'));
    resize(375);
    expect(screen.getByTestId('rules-document-scroll')).toBeTruthy();
    resize(951);
    expect(screen.getByTestId('rules-wide-search-input').props.value).toBe('actions');
    fireEvent.press(screen.getByTestId('rules-wide-clear'));
    expect(screen.getByTestId('rules-toc-panel')).toBeTruthy();
  });

  it('meets a vertical fold: contents end at the fold, the reader starts after it', () => {
    const fold = {x: 433, y: 0, width: 24, height: 626};
    const screen = render(
      <DeviceLayoutContext.Provider value={{...defaultDeviceLayout, fold}}>
        <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />
      </DeviceLayoutContext.Provider>,
    );
    fireEvent(screen.getByTestId('rules-workspace'), 'layout', {nativeEvent: {layout: {width: 826, height: 626}}});
    const browser = screen.getByTestId('rules-workspace').props.children[0];
    expect(browser.props.style.width).toBe(433);
    expect(browser.props.style.marginRight).toBe(24);
  });

  it('keeps reading across a horizontal fold (continuous text does not move)', () => {
    const fold = {x: 0, y: 433, width: 826, height: 24};
    const screen = render(
      <DeviceLayoutContext.Provider value={{...defaultDeviceLayout, fold}}>
        <RulesScreen documentOverride={documentFixture} indexOverride={indexFixture} />
      </DeviceLayoutContext.Provider>,
    );
    fireEvent(screen.getByTestId('rules-workspace'), 'layout', {nativeEvent: {layout: {width: 826, height: 828}}});
    const browser = screen.getByTestId('rules-workspace').props.children[0];
    expect(browser.props.style.width).toBe(413);
    expect(browser.props.style.marginRight).toBe(0);
  });
});

jest.mock('react-native-elements', () => ({Icon: () => null}));
