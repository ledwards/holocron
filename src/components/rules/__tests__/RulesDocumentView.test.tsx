import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import {FlatList} from 'react-native';
import RulesDocumentView, {RulesDocumentViewHandle} from '../RulesDocumentView';
import AllCardsContext from '../../../contexts/AllCardsContext';
import {Theme} from '../../../types/interfaces';

const theme: Theme = {
  name: 'dark',
  backgroundColor: '#000',
  foregroundColor: '#fff',
  dividerColor: '#333',
  translucentBackgroundColor: 'rgba(0,0,0,0.5)',
};
const LINK_BLUE = '#2F6BFF';

describe('RulesDocumentView', () => {
  it('keeps unmeasured page estimates stable when a neighboring page is measured', () => {
    const sections = [1, 2, 3].map(page => ({
      id: `${page}`, anchor: `${page}`, title: `Page ${page}`, level: 1,
      pageRef: page, blocks: [{type: 'paragraph' as const, textRuns: [{text: 'Content.'}]}],
    }));
    const screen = render(<RulesDocumentView theme={theme} query="" sections={sections} />);
    const layout = () => screen.UNSAFE_getByType(FlatList).props.getItemLayout(null, 2);
    const initial = layout();
    fireEvent(screen.getByTestId('rules-page-card-1'), 'layout', {nativeEvent: {layout: {height: 1000}}});
    const first = layout();
    fireEvent(screen.getByTestId('rules-page-card-1'), 'layout', {nativeEvent: {layout: {height: 1200}}});
    expect(layout().length).toBe(initial.length);
    expect(layout().offset - first.offset).toBe(200);
  });

  it('corrects an estimated long jump until the requested page is actually visible', () => {
    jest.useFakeTimers();
    const scroll = jest.spyOn(FlatList.prototype, 'scrollToIndex').mockImplementation(() => {});
    const ref = React.createRef<RulesDocumentViewHandle>();
    const sections = Array.from({length: 100}, (_, i) => ({
      id: `page-${i}`, anchor: `page-${i}`, title: `Page ${i + 1}`, level: 1,
      pageRef: i + 1, blocks: [{type: 'paragraph' as const, textRuns: [{text: 'Content.'}]}],
    }));
    const screen = render(<RulesDocumentView ref={ref} theme={theme} query="" sections={sections} />);
    act(() => ref.current?.scrollToPage(99));
    act(() => jest.advanceTimersByTime(150));
    expect(scroll).toHaveBeenLastCalledWith({index: 98, animated: false, viewPosition: 0});
    expect(scroll).toHaveBeenCalledTimes(2);
    fireEvent(screen.UNSAFE_getByType(FlatList), 'viewableItemsChanged', {
      viewableItems: [{index: 98, item: {page: 99}, isViewable: true}],
    });
    act(() => jest.advanceTimersByTime(1000));
    expect(scroll).toHaveBeenCalledTimes(2);
    screen.unmount();
    scroll.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('continues matching-page navigation from the selected search result', () => {
    const ref = React.createRef<RulesDocumentViewHandle>();
    render(<RulesDocumentView ref={ref} theme={theme} query="vader" sections={[
      {id: 'one', anchor: 'one', title: 'One', level: 1, pageRef: 10,
        blocks: [{type: 'paragraph', textRuns: [{text: 'Darth Vader. Vader again.'}]}]},
      {id: 'two', anchor: 'two', title: 'Two', level: 1, pageRef: 19,
        blocks: [{type: 'paragraph', textRuns: [{text: 'Vader is here.'}]}]},
      {id: 'three', anchor: 'three', title: 'Three', level: 1, pageRef: 20,
        blocks: [{type: 'paragraph', textRuns: [{text: 'Vader is also here.'}]}]},
    ]} />);
    expect(ref.current?.selectQueryPage(19)).toEqual({current: 2, total: 3});
    expect(ref.current?.jumpToQueryHit('next')).toEqual({current: 3, total: 3});
    expect(ref.current?.jumpToQueryHit('prev')).toEqual({current: 2, total: 3});
  });

  it('renders source subsection hierarchy and preserves italic spans without legacy text repair', () => {
    const screen = render(<RulesDocumentView preserveSourceFormatting theme={theme} query="" sections={[
      {id: 'life-force', anchor: 'life-force', title: 'Life Force', level: 3, pageRef: 9,
        blocks: [{type: 'paragraph', text: 'Your Reserve Deck. Continue normally.', textRuns: [
          {text: 'Your Reserve Deck.', italic: true}, {text: ' Continue normally.'},
        ]}]},
    ]} />);
    expect(screen.getByText('Life Force').props.style.fontSize).toBe(17);
    expect(screen.getByText('Your Reserve Deck.')).toBeTruthy();
    expect(screen.getByText(' Continue normally.')).toBeTruthy();
  });

  it('navigates to internal anchor when link run is pressed', () => {
    const onAnchorNavigation = jest.fn();
    const {getByTestId} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 1,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {
                type: 'paragraph',
                textRuns: [{text: 'See chapter 2', href: '#chapter-2'}],
              },
            ],
          },
        ]}
        query=""
        theme={theme}
        onAnchorNavigation={onAnchorNavigation}
      />,
    );

    fireEvent.press(getByTestId('rules-inline-link-introduction-0-0'));
    expect(onAnchorNavigation).toHaveBeenCalledWith('chapter-2');
  });

  it('shows section page badge for provenance', () => {
    const {getByText} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 7,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {type: 'paragraph', textRuns: [{text: 'Welcome.'}]},
            ],
          },
        ]}
        query=""
        theme={theme}
      />,
    );

    expect(getByText('Page 7')).toBeTruthy();
  });

  it('renders emphasis traits from rules text runs', () => {
    const {getByTestId} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 7,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {
                type: 'paragraph',
                textRuns: [
                  {text: 'Bold', bold: true, href: '#chapter-2'},
                  {text: ' and '},
                  {text: 'Italic', italic: true, href: '#chapter-3'},
                ],
              },
            ],
          },
        ]}
        query=""
        theme={theme}
      />,
    );

    expect(getByTestId('rules-inline-link-introduction-0-0').props.style).toEqual(
      expect.objectContaining({fontWeight: '700', color: LINK_BLUE}),
    );
    expect(getByTestId('rules-inline-link-introduction-0-2').props.style).toEqual(
      expect.objectContaining({fontStyle: 'italic', color: LINK_BLUE}),
    );
  });

  it('renders exact card title matches as links and opens card modal', () => {
    const mockCards = [
      {
        title: 'Reshuffle',
        imageUrl: 'https://example.com/reshuffle.jpg',
      },
    ] as any;

    const {getByTestId, queryByTestId} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 7,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: 'You may Reshuffle at end of turn.'}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    expect(queryByTestId('rules-card-modal-image')).toBeNull();
    fireEvent.press(getByTestId('rules-card-link-introduction-0-0-1'));
    expect(getByTestId('rules-card-link-introduction-0-0-1').props.style).toEqual(
      expect.objectContaining({color: LINK_BLUE, textDecorationLine: 'underline'}),
    );

    expect(getByTestId('rules-card-modal-image').props.source).toEqual({
      uri: 'https://example.com/reshuffle.jpg',
    });
  });

  it('does not link non-exact casing of card titles', () => {
    const mockCards = [
      {
        title: 'Reshuffle',
        imageUrl: 'https://example.com/reshuffle.jpg',
      },
    ] as any;

    const {queryByTestId} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 7,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: 'You may reshuffle at end of turn.'}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    expect(queryByTestId('rules-card-link-introduction-0-0-1')).toBeNull();
  });

  it('matches apostrophe variants while preserving case sensitivity', () => {
    const mockCards = [
      {
        title: "Amidala's Blaster",
        imageUrl: 'https://example.com/amidala-blaster.jpg',
      },
    ] as any;

    const {getByTestId} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 7,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: 'A hit from Amidala’s Blaster is permanent.'}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    fireEvent.press(getByTestId('rules-card-link-introduction-0-0-1'));
    expect(getByTestId('rules-card-modal-image').props.source).toEqual({
      uri: 'https://example.com/amidala-blaster.jpg',
    });
  });

  it('links titles even when cards.json uses uniqueness markers', () => {
    const mockCards = [
      {
        title: '•Lando Calrissian, Scoundrel',
        imageUrl: 'https://example.com/lando.jpg',
      },
    ] as any;

    const {getByTestId} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 7,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: 'Lando Calrissian, Scoundrel gains power.'}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    fireEvent.press(getByTestId('rules-card-link-introduction-0-0-0'));
    expect(getByTestId('rules-card-modal-image').props.source).toEqual({
      uri: 'https://example.com/lando.jpg',
    });
  });

  it('prefers the longest exact card title when titles overlap', () => {
    const mockCards = [
      {
        title: 'Blaster',
        imageUrl: 'https://example.com/blaster.jpg',
      },
      {
        title: "Amidala's Blaster",
        imageUrl: 'https://example.com/amidala-blaster.jpg',
      },
    ] as any;

    const {getByTestId} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 7,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: "A hit from Amidala's Blaster is permanent."}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    fireEvent.press(getByTestId('rules-card-link-introduction-0-0-1'));
    expect(getByTestId('rules-card-modal-image').props.source).toEqual({
      uri: 'https://example.com/amidala-blaster.jpg',
    });
  });

  it('renders one container per page', () => {
    const {getAllByTestId} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 7,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {type: 'paragraph', pageRef: 7, textRuns: [{text: 'First paragraph.'}]},
              {type: 'paragraph', pageRef: 7, textRuns: [{text: 'Second paragraph.'}]},
            ],
          },
        ]}
        query=""
        theme={theme}
      />,
    );

    expect(getAllByTestId('rules-page-card-7')).toHaveLength(1);
  });

  it('normalizes glossary artifacts for split terms and malformed hyphenation', () => {
    const {getByText} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'glossary',
            title: 'Glossary',
            level: 1,
            anchor: 'glossary',
            pageRef: 9,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Glossary'}]},
              {
                type: 'paragraph',
                textRuns: [
                  {text: "Hand All cards held in a player's hand.", bold: true},
                  {text: "Each player's hand starts with 8 cards."},
                ],
              },
              {
                type: 'paragraph',
                textRuns: [
                  {text: 'Re', bold: true},
                  {text: '\n-'},
                  {text: 'circulating', bold: true},
                  {text: " happens at the end of each player's turn."},
                ],
              },
            ],
          },
        ]}
        query=""
        theme={theme}
      />,
    );

    expect(getByText('Hand')).toBeTruthy();
    expect(getByText("All cards held in a player's hand.")).toBeTruthy();
    expect(getByText('Re-circulating')).toBeTruthy();
  });

  it('autolinks "See <section>" references and uses shared link styling', () => {
    const onAnchorNavigation = jest.fn();
    const {getByTestId} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 1,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {type: 'paragraph', textRuns: [{text: 'See Timing, Ch. 2 for details.'}]},
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
        ]}
        query=""
        theme={theme}
        onAnchorNavigation={onAnchorNavigation}
      />,
    );

    fireEvent.press(getByTestId('rules-see-link-introduction-0-0-0'));
    expect(getByTestId('rules-see-link-introduction-0-0-0').props.style).toEqual(
      expect.objectContaining({color: LINK_BLUE, textDecorationLine: 'underline'}),
    );
    expect(onAnchorNavigation).toHaveBeenCalledWith('timing');
  });

  it('forces list bullets to begin on a new line', () => {
    const {getByText} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 1,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {
                type: 'paragraph',
                textRuns: [{text: 'Deck is empty. • play a card; • use game text.'}],
              },
            ],
          },
        ]}
        query=""
        theme={theme}
      />,
    );

    expect(getByText('Deck is empty.\n• play a card;\n• use game text.')).toBeTruthy();
  });

  it('does not force newline for uniqueness bullet directly before a card title', () => {
    const mockCards = [
      {
        title: '•Lando Calrissian, Scoundrel',
        imageUrl: 'https://example.com/lando.jpg',
      },
    ] as any;

    const {getByText} = render(
      <AllCardsContext.Provider value={mockCards}>
        <RulesDocumentView
          sections={[
            {
              id: 'intro',
              title: 'Introduction',
              level: 1,
              anchor: 'introduction',
              pageRef: 1,
              blocks: [
                {type: 'heading', textRuns: [{text: 'Introduction'}]},
                {
                  type: 'paragraph',
                  textRuns: [{text: 'Use •Lando Calrissian, Scoundrel now.'}],
                },
              ],
            },
          ]}
          query=""
          theme={theme}
        />
      </AllCardsContext.Provider>,
    );

    expect(getByText('Use •Lando Calrissian, Scoundrel now.')).toBeTruthy();
  });

  it('renders query highlights with yellow marker styling', () => {
    const {getByText} = render(
      <RulesDocumentView
        sections={[
          {
            id: 'intro',
            title: 'Introduction',
            level: 1,
            anchor: 'introduction',
            pageRef: 1,
            blocks: [
              {type: 'heading', textRuns: [{text: 'Introduction'}]},
              {type: 'paragraph', textRuns: [{text: 'Actions happen in windows.'}]},
            ],
          },
        ]}
        query="actions"
        theme={theme}
      />,
    );

    expect(getByText('Actions').props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(255, 230, 97, 0.9)',
      }),
    );
  });
});
