import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import RulesReaderBar, {readerBarSpace} from '../RulesReaderBar';

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('react-native-elements', () => ({Icon: () => null}));

const props = {
  pageLabel: 'Page 10', query: '', hitProgressLabel: '', bottom: 83,
  onOpenSearch: jest.fn(), onPrevHit: jest.fn(), onNextHit: jest.fn(),
};

describe('Rules reader bar', () => {
  it('is only the page label while not searching', () => {
    const screen = render(<RulesReaderBar {...props} />);
    expect(screen.getByTestId('rules-visible-pages').props.children).toBe('Page 10');
    expect(screen.queryByTestId('rules-match-bar')).toBeNull();
    expect(screen.queryByTestId('rules-hit-progress')).toBeNull();
  });

  it('holds the query, match position and previous/next in the same bar as the page', () => {
    const next = jest.fn();
    const prev = jest.fn();
    const screen = render(
      <RulesReaderBar {...props} query="force" hitProgressLabel="3 of 156 pages" onPrevHit={prev} onNextHit={next} />,
    );
    expect(screen.getByText('force')).toBeTruthy();
    expect(screen.getByTestId('rules-hit-progress').props.children).toBe('3 of 156 pages');
    expect(screen.getByTestId('rules-visible-pages').props.children).toBe('Page 10');
    fireEvent.press(screen.getByTestId('rules-next-hit'));
    fireEvent.press(screen.getByTestId('rules-prev-hit'));
    expect(next).toHaveBeenCalledTimes(1);
    expect(prev).toHaveBeenCalledTimes(1);
  });

  it('opens the search when the query is tapped', () => {
    const open = jest.fn();
    const screen = render(<RulesReaderBar {...props} query="force" onOpenSearch={open} />);
    fireEvent.press(screen.getByLabelText('Edit rules search'));
    expect(open).toHaveBeenCalled();
  });

  it('reserves more room at the end of the text while searching', () => {
    expect(readerBarSpace(true)).toBeGreaterThan(readerBarSpace(false));
  });
});
