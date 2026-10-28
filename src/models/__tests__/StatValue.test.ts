import Card from '../Card';
import FilterQuery from '../FilterQuery';
import FilterQuerySet from '../FilterQuerySet';
import {parseStat} from '../StatValue';
import fixture from '../../data/__fixtures__/query-audit.json';

describe('parseStat reads every stat notation upstream ships', () => {
  // Each raw value below occurs in the upstream catalogue (2026-10-27).
  it.each([
    ['6', [6], undefined],
    ['0', [0], undefined],
    ['½', [0.5], undefined],
    ['4½', [4.5], undefined],
    ['π', [Math.PI], undefined],
    ['π or 2π', [Math.PI, 2 * Math.PI], undefined],
    ['1 or 6', [1, 6], undefined],
    ['7 or 1', [7, 1], undefined],
    ['(4)', [4], undefined],
    ['*', [], '*'],
    ['X', [], 'x'],
    ['Y', [], 'y'],
    ['IV', [], 'iv'],
  ])('%s', (raw, numbers, symbol) => {
    expect(parseStat(raw)).toEqual({numbers, symbol});
  });

  it('reads typed values the same way, "pi" included', () => {
    expect(parseStat('pi')).toEqual({numbers: [Math.PI], symbol: undefined});
    expect(parseStat('4.5')).toEqual({numbers: [4.5], symbol: undefined});
  });

  it('treats a stat the card does not have as no stat at all', () => {
    expect(parseStat(undefined)).toBeUndefined();
    expect(parseStat('')).toBeUndefined();
    expect(parseStat(null)).toBeUndefined();
  });
});

describe('queries on symbolic stats', () => {
  const cards: Card[] = fixture.cards.map(
    (c: {set: string}) => new Card(c as never, fixture.sets.find((s: {id: string}) => s.id === c.set) as never),
  );
  const titles = (query: string) => {
    const set = new FilterQuerySet(query, cards);
    return set.valid() ? set.execute(cards).map(c => c.title).sort() : [];
  };

  it('finds the variable-power card', () => {
    expect(titles('power = *')).toEqual(['Bog-wing']);
    expect(titles('power=*')).toEqual(['Bog-wing']);
    expect(titles('power *')).toEqual(['Bog-wing']);
  });

  it('"power != *" lists cards with a numeric power, and no card without power', () => {
    const found = titles('power != *');
    expect(found).toContain('•Darth Vader');
    expect(found).not.toContain('Bog-wing');
    expect(found).not.toContain('Alter');
  });

  it('a symbol is never bigger or smaller than a number', () => {
    expect(titles('power > 100')).toEqual([]);
    expect(titles('power < 100')).not.toContain('Bog-wing');
  });

  it('still refuses text that is neither a number nor a stat symbol', () => {
    // "po=3" must not run as power = "o=3" (the chip may still show "power")
    const typo = new FilterQuery('po=3');
    expect(typo.valid()).toBe(false);
    expect(typo.value).toBeUndefined();
    expect(new FilterQuery('power = blue').valid()).toBe(false);
  });
});
