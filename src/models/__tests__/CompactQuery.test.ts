/**
 * Queries typed without the space bar (2026-10-27).
 *
 * Phone users type "setcpremiere", not "set c premiere". The contract:
 * removing every space from a query must not change its results, and a
 * spaced query that already finds cards must find exactly the same cards as
 * before. Runs over the verbatim upstream rows in query-audit.json.
 *
 * Every parity case also pins the spaced result explicitly, so two empty
 * result lists can never pass as "equal".
 */
import Card from '../Card';
import FilterQuery from '../FilterQuery';
import FilterQuerySet from '../FilterQuerySet';
import {searchCardsByTitle} from '../TitleSearch';
import fixture from '../../data/__fixtures__/query-audit.json';

const cards: Card[] = fixture.cards.map(
  (c: {set: string}) => new Card(c as any, fixture.sets.find((s: {id: string}) => s.id === c.set)),
);

const titles = (query: string): string[] => {
  const set = new FilterQuerySet(query, cards);
  return set.valid() ? set.execute(cards).map(c => c.title).sort() : [];
};
const compact = (query: string) => query.replace(/\s+/g, '');

describe('compact queries find what the spaced query finds', () => {
  it.each([
    // the screenshot
    ['set c premiere', ['Alter', 'Sense', '•Darth Vader', '•Devastator', '•Millennium Falcon', '•Vader']],
    // multi-word values
    ['title c millennium falcon', ['•Millennium Falcon']],
    ['title = commander brandei', ['•Commander Brandei']],
    ['set c cloud city', ['•Captain Han Solo']],
    ['set c special edition', ['2X-7KPR (Tooex)']],
    ['gametext c ship-docking capability', ['•Devastator', '•Millennium Falcon']],
    ['lore c dark lord of the sith', ['•Darth Vader']],
    ['characteristics c security droid', ['2X-7KPR (Tooex)']],
    // field names that start with another field's one-letter alias
    ['matches falcon', ['•Captain Han Solo']],
    ['type c starship', ['•Devastator', '•Invisible Hand', '•Millennium Falcon']],
    ['type effect', ['•Coarse And Rough And Irritating', "•I Don't Like Sand"]],
    ['landspeed = 3', ['•Blizzard Scout 1']],
    // comparators, including multi-word ones
    ['power > 6', ['•Devastator']],
    ['power gt 6', ['•Devastator']],
    ['power greater than 6', ['•Devastator']],
    ['power ≥ 6', ['•Darth Vader', '•Devastator', '•Invisible Hand']],
    ['power = 6', ['•Darth Vader', '•Invisible Hand']],
    ['side = light', ['Sense', '•Captain Han Solo', "•I Don't Like Sand", '•Millennium Falcon']],
    ['title does not contain e', ['Bog-wing', '•Blizzard Scout 1', '•Captain Han Solo']],
    // "=" is exact even though "contains" would find more (found on live
    // data: "title = luke skywalker" briefly returned 11 cards instead of 1)
    ['title = vader', ['•Vader']],
    // "m" is both maneuver and matching; maneuver cannot read "c falcon"
    ['m c falcon', ['•Captain Han Solo']],
    // and
    ['side = dark and power > 5', ['•Darth Vader', '•Devastator', '•Invisible Hand']],
    ['set c premiere and side = dark and type c character', ['•Darth Vader', '•Vader']],
    // a "not" clause matches almost everything, so it must not swallow the rest
    ['title nc e and side = light', ['•Captain Han Solo']],
    ['set c premiere and type c starship', ['•Devastator', '•Millennium Falcon']],
  ])('%s', (spaced, expected) => {
    expect(titles(spaced)).toEqual([...expected].sort());
    expect(titles(compact(spaced))).toEqual([...expected].sort());
  });
});

describe('compact queries that only work without separators today', () => {
  it.each([
    ['power>=6', ['•Darth Vader', '•Devastator', '•Invisible Hand']],
    ['power6', ['•Darth Vader', '•Invisible Hand']],
    ['pwr6', ['•Darth Vader', '•Invisible Hand']],
    ['sidelight', ['Sense', '•Captain Han Solo', "•I Don't Like Sand", '•Millennium Falcon']],
    ['side=dark', ['2X-7KPR (Tooex)', 'Alter', 'Alter (Premiere) (V)', 'Bog-wing', 'Sense', '•Blizzard Scout 1',
      '•Coarse And Rough And Irritating', '•Commander Brandei', '•Darth Vader', '•Devastator', '•Invisible Hand', '•Vader']],
    ['cancelscsense', ['Alter']],
    ['typeeffect', ['•Coarse And Rough And Irritating', "•I Don't Like Sand"]],
    ['titlevader', ['•Darth Vader', '•Vader']],
    ['loredarklordofthesith', ['•Darth Vader']],
    ['isccommander', ['•Commander Brandei']],
    ['rarityr1', ['•Blizzard Scout 1', '•Darth Vader', '•Devastator', '•Millennium Falcon']],
    // "c" is also the "contains" comparator; "rarity c" means rarity C.
    ['rarityc', ['2X-7KPR (Tooex)', 'Bog-wing']],
  ])('%s', (query, expected) => {
    expect(titles(query)).toEqual([...expected].sort());
  });
});

describe('"and" without spaces', () => {
  it('splits where both halves are real clauses', () => {
    expect(titles('sidedarkandpower>5')).toEqual(['•Darth Vader', '•Devastator', '•Invisible Hand']);
    expect(titles('setcpremiereandtypecstarship')).toEqual(['•Devastator', '•Millennium Falcon']);
    expect(new FilterQuerySet('sidedarkandpower>5', cards).length()).toBe(2);
  });

  it('does not split inside a word', () => {
    expect(titles('titleccommander')).toEqual(['•Commander Brandei']);
    expect(titles('titlechand')).toEqual(['•Invisible Hand']);
    expect(titles('landspeed>2')).toEqual(['•Blizzard Scout 1']);
    expect(titles('titlecoarseandrough')).toEqual(['•Coarse And Rough And Irritating']);
  });

  it('does not split before a one-letter field alias, even without cards', () => {
    // "rough" reads as rarity "ough" ("r" is the rarity alias). With cards the
    // data rules it out; without cards only the two-letter rule does.
    expect(new FilterQuerySet('titlecoarseandrough').length()).toBe(1);
    expect(new FilterQuerySet('sidedarkandpower>5').length()).toBe(2);
  });

  it('finds the right "and" when an earlier one is inside a word', () => {
    expect(titles('titlechandandsidedark')).toEqual(['•Invisible Hand']);
  });
});

describe('spaced queries are not broadened', () => {
  // The ignore-spaces retry runs only when the exact match finds nothing, so
  // a query that already returns cards returns exactly the same cards.
  it('keeps exact matching when the exact match finds cards', () => {
    // "hand" also occurs across the gap in "Rough And": an always-on
    // ignore-spaces match would add "Coarse And Rough And Irritating".
    expect(titles('title c hand')).toEqual(['•Invisible Hand']);
    expect(titles('titlechand')).toEqual(['•Invisible Hand']);
  });

  it('keeps the value as typed for the status bar', () => {
    const q = new FilterQuery('title c Millennium Falcon', cards);
    expect(q.value).toBe('Millennium Falcon');
    expect(q.rawValue).toBe('Millennium Falcon');
  });

  it('shows a partly typed comparator as a comparator, not a value', () => {
    const q = new FilterQuery('power gr');
    expect(q.field?.name).toBe('power');
    expect(q.valid()).toBe(false);
    expect(q.partiallyValidComparator()).toBe(true);
  });
});

describe('ambiguous letters are settled by the data', () => {
  const rarity = (r: string, id: string) =>
    new Card({gempId: id, side: 'Dark', set: '1', rarity: r,
      front: {title: id, type: 'Effect', subType: '', characteristics: [], icons: [], imageUrl: ''}} as any,
    {id: '1', name: 'Premiere', abbr: 'P', gempName: 'Premiere'});
  const pool = [rarity('C2', 'common2'), rarity('U2', 'uncommon2'), rarity('R1', 'rare1')];

  it('"rarityc2" means rarity C2, not "rarity contains 2"', () => {
    const set = new FilterQuerySet('rarityc2', pool);
    expect(set.execute(pool).map(c => c.id)).toEqual(['common2']);
  });

  it('"setcpremiere" means set contains premiere, not set = "cpremiere"', () => {
    const q = new FilterQuery('setcpremiere', cards);
    expect(q.comparator?.name).toBe('matches');
    expect(q.value).toBe('premiere');
  });
});

describe('title search mode without spaces', () => {
  const found = (text: string) => searchCardsByTitle(cards, text).map(c => c.title).sort();

  it('matches across spaces when the spaced form finds nothing', () => {
    expect(found('darthvader')).toEqual(['•Darth Vader']);
    expect(found('millenniumfalcon')).toEqual(['•Millennium Falcon']);
    expect(found('idontlikesand')).toEqual(["•I Don't Like Sand"]);
  });

  it('keeps unordered word matching for spaced input', () => {
    expect(found('vader darth')).toEqual(['•Darth Vader']);
    expect(found('vader')).toEqual(['•Darth Vader', '•Vader']);
  });
});
