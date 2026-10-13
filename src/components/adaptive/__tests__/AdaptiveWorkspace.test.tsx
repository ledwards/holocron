import React, {useState} from 'react';
import {TextInput, Text} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import AdaptiveWorkspace from '../AdaptiveWorkspace';
import CardDetail from '../CardDetail';
import {fitArtwork, workspaceLayout} from '../../../lib/adaptiveLayout';
import {deckEntries} from '../../../presenters/adaptiveDeck';

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 83,
}));

function Harness() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(false);
  return (
    <AdaptiveWorkspace
      title="Results"
      selected={selected}
      onBack={() => setSelected(false)}
      browser={
        <>
          <TextInput testID="query" value={query} onChangeText={setQuery} />
          <Text testID="result" onPress={() => setSelected(true)}>
            Select
          </Text>
        </>
      }
      detail={<Text testID="selection">Selected detail</Text>}
    />
  );
}
const layout = (width: number) => ({
  nativeEvent: {layout: {width, height: 650, x: 0, y: 0}},
});

describe('adaptive workspace', () => {
  it('retains query and selection across wide, compact, and wide layouts', () => {
    const screen = render(<Harness />);
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', layout(951));
    fireEvent.changeText(screen.getByTestId('query'), 'vader');
    fireEvent.press(screen.getByTestId('result'));
    expect(screen.queryByTestId('adaptive-back')).toBeNull();
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', layout(375));
    expect(screen.queryByTestId('query')).toBeNull();
    expect(screen.getByTestId('selection')).toBeTruthy();
    fireEvent.press(screen.getByTestId('adaptive-back'));
    expect(screen.getByTestId('query').props.value).toBe('vader');
    fireEvent.press(screen.getByTestId('result'));
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', layout(669));
    expect(screen.getByTestId('query').props.value).toBe('vader');
    expect(screen.getByTestId('selection')).toBeTruthy();
  });
  it('uses available width and gives larger text room instead of forcing panes', () => {
    expect(workspaceLayout(375).split).toBe(false);
    expect(workspaceLayout(669).split).toBe(true);
    expect(workspaceLayout(669, 1.5).split).toBe(false);
  });
  it.each([
    [320, 420, false],
    [500, 300, false],
    [320, 420, true],
    [500, 300, true],
  ])(
    'contains complete artwork in a %s × %s pane (sideways %s)',
    (w, h, sideways) => {
      const fit = fitArtwork(
        w as number,
        h as number,
        339,
        475,
        sideways as boolean,
      );
      expect(fit.frameWidth).toBeLessThanOrEqual((w as number) + 0.001);
      expect(fit.frameHeight).toBeLessThanOrEqual((h as number) + 0.001);
      expect(fit.imageWidth / fit.imageHeight).toBeCloseTo(339 / 475);
      expect(fit.rotate).toBe(sideways);
    },
  );
  it('does not rotate a source that is already landscape', () => {
    expect(fitArtwork(300, 500, 475, 339, true).rotate).toBe(false);
  });
  it('flips artwork and resets the back face when selecting another card', () => {
    const card = {
      id: 'one',
      title: 'Objective',
      imageUrl: 'front',
      backImageUrl: 'back',
    };
    const screen = render(<CardDetail card={card} />);
    fireEvent.press(screen.getByTestId('card-flip'));
    expect(screen.getByTestId('card-detail-artwork').props.source.uri).toBe(
      'back',
    );
    screen.rerender(
      <CardDetail card={{...card, id: 'two', imageUrl: 'new-front'}} />,
    );
    expect(screen.getByTestId('card-detail-artwork').props.source.uri).toBe(
      'new-front',
    );
  });
  it('keeps quantities and artwork for deck entries missing from the card cache', () => {
    expect(
      deckEntries(
        [
          {
            id: 'site',
            title: 'Site',
            quantity: 3,
            subType: 'Site',
            imageUrl: 'site.gif',
          },
        ],
        [],
      ),
    ).toEqual([
      expect.objectContaining({
        id: 'site',
        title: 'Site',
        quantity: 3,
        sideways: true,
        imageUrl: 'site.gif',
      }),
    ]);
    expect(deckEntries({missing: 2}, [])[0]).toMatchObject({
      id: 'missing',
      quantity: 2,
    });
  });
});

jest.mock('react-native-elements', () => ({Icon: () => null}));
