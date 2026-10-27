/**
 * Natural-language query audit (2026-10-27).
 *
 * Runs the real parser and filters over VERBATIM upstream card rows
 * (src/data/__fixtures__/query-audit.json): numeric stats are strings or
 * absent, power can be "*". Hand-built fixtures with numeric stats hide
 * several of the defects below.
 *
 * Two kinds of test live here:
 *
 * 1. "pinned behaviour" — what works today. A parser refactor must keep
 *    every one of these green.
 * 2. "known defects" — `it.failing` with the CORRECT expectation. Jest
 *    reports these as passing while the bug exists. When a fix lands, the
 *    test starts failing with "Failing test passed even though it was
 *    expected to fail" — change `it.failing` to `it` in the same commit.
 *    Never delete one to get green; that hides the defect again.
 *
 * Expectations are written as PARITY with an equivalent query that already
 * works, or as an explicit title list, so each defect test flips on its own
 * fix and is not coupled to another defect.
 */
import Card from '../Card';
import FilterQuery from '../FilterQuery';
import FilterQuerySet from '../FilterQuerySet';

const fixture = require('../../data/__fixtures__/query-audit.json');
const cards: Card[] = fixture.cards.map(
  (c: {set: string}) => new Card(c as any, fixture.sets.find((s: {id: string}) => s.id === c.set)),
);

const titles = (query: string): string[] => {
  const set = new FilterQuerySet(query);
  return set.valid() ? set.execute(cards).map(c => c.title).sort() : [];
};

describe('query audit: fixture sanity', () => {
  it('carries real upstream shapes the parser has to cope with', () => {
    const byTitle = (t: string) => cards.find(c => c.title === t);
    expect(byTitle('•Darth Vader')?.power).toBe('6'); // a string, not a number
    expect(byTitle('Bog-wing')?.power).toBe('*');
    expect(byTitle('Alter')?.power).toBe(0); // absent upstream, defaulted by Card
    expect(cards).toHaveLength(16);
  });
});

describe('query audit: pinned behaviour', () => {
  it.each([
    ['title c vader', ['•Darth Vader', '•Vader']],
    ['t c vader', ['•Darth Vader', '•Vader']],
    ['name c vader', ['•Darth Vader', '•Vader']],
    ['title = alter', ['Alter']],
    ['title = sense', ['Sense', 'Sense']],
    ['type c character', ['2X-7KPR (Tooex)', '•Captain Han Solo', '•Commander Brandei', '•Darth Vader', '•Vader']],
    ['power = 6', ['•Darth Vader', '•Invisible Hand']],
    ['power is 6', ['•Darth Vader', '•Invisible Hand']],
    ['pwr6', ['•Darth Vader', '•Invisible Hand']],
    ['power > 6', ['•Devastator']],
    ['power over 6', ['•Devastator']],
    ['power ≥ 6', ['•Darth Vader', '•Devastator', '•Invisible Hand']],
    ['side = dark and power > 5', ['•Darth Vader', '•Devastator', '•Invisible Hand']],
    ['matches falcon', ['•Captain Han Solo']],
    ['set eq premiere', ['Alter', 'Sense', '•Darth Vader', '•Devastator', '•Millennium Falcon']],
    // "matches" is a substring test, so Premiere's 2-player intro set is in.
    ['set c premiere', ['Alter', 'Sense', '•Darth Vader', '•Devastator', '•Millennium Falcon', '•Vader']],
    ['set c v0', ['Alter (Premiere) (V)', '•Coarse And Rough And Irritating', "•I Don't Like Sand"]],
  ])('%s', (query, expected) => {
    expect(titles(query)).toEqual([...expected].sort());
  });

  it('reports an unknown field as invalid instead of guessing', () => {
    const q = new FilterQuery('colour = red');
    expect(q.valid()).toBe(false);
    expect(titles('colour = red')).toEqual([]);
  });
});

describe('query audit: known defects', () => {
  // D1. FilterQuerySet splits on the substring "and", not the word. Any
  // title, value or FIELD containing "and" is cut in two: 165 live titles
  // ("Commander …", "… Hand", "Coarse And Rough …") and the landspeed field.
  it.failing('D1 "title c commander" is not split inside "commander"', () => {
    expect(titles('title c commander')).toEqual(['•Commander Brandei']);
  });
  it.failing('D1 "title c hand" is not split inside "hand"', () => {
    expect(titles('title c hand')).toEqual(['•Invisible Hand']);
  });
  it.failing('D1 "landspeed > 2" is not split inside the field name', () => {
    expect(titles('landspeed > 2')).toEqual(['•Blizzard Scout 1']);
  });

  // D2. ASCII ">=" / "<=" parse as ">" / "<" plus a value of "= 6": the field
  // regex takes the first separator in list order, not the longest. "≥" works.
  it.failing('D2 "power >= 6" equals "power ≥ 6"', () => {
    expect(titles('power >= 6')).toEqual(titles('power ≥ 6'));
    expect(titles('power >= 6')).not.toEqual([]);
  });
  it.failing('D2 "deploy <= 3" equals "deploy ≤ 3"', () => {
    expect(titles('deploy <= 3')).toEqual(titles('deploy ≤ 3'));
    expect(titles('deploy <= 3')).not.toEqual([]);
  });

  // D3. Numeric "not equal" compares the stored STRING with !== against a
  // number, so it is true for every card. Live: "power != 6" returns all 3664.
  it.failing('D3 "power != 6" excludes power-6 cards', () => {
    expect(titles('power != 6')).not.toContain('•Darth Vader');
    expect(titles('power != 6')).not.toContain('•Invisible Hand');
  });
  it.failing('D3 "power is not 6" parses its value as "6"', () => {
    expect(new FilterQuery('power is not 6').value).toBe('6');
  });

  // D4. The default comparator only applies when there is NO space between
  // field and value: "pwr6" works, "power 6" is invalid. The help text and
  // README imply "pulls falcon" / "power 6" style queries work.
  it.failing('D4 "power 6" equals "pwr6"', () => {
    expect(titles('power 6')).toEqual(titles('pwr6'));
  });
  it.failing('D4 "side light" equals "side = light"', () => {
    expect(titles('side light')).toEqual(titles('side = light'));
  });

  // D5. Comparator detection scans the WHOLE query, field name included.
  // "cancels" contains "nc" (the alias for "not includes"), so the query is
  // inverted. The old commented-out test in FilterQuery.test.ts saw this.
  it.failing('D5 "cancels c sense" finds the cards that cancel Sense', () => {
    expect(titles('cancels c sense')).toEqual(['Alter']);
  });
  it.failing('D5 "canceledby c sense" finds the cards Sense cancels', () => {
    expect(titles('canceledby c sense')).toEqual(['Alter']);
  });

  // D6. …and the value too: "premiere" contains "m" (an alias for
  // "matches"), which ties with "=" and wins on list order, so "=" quietly
  // becomes a substring test whenever the value contains "c" or "m".
  it.failing('D6 "set = premiere" is exact, like "set eq premiere"', () => {
    expect(titles('set = premiere')).toEqual(titles('set eq premiere'));
  });

  // D7. A stat the card does not have is stored as 0, so every Effect and
  // Interrupt "has power 0". Live: "power < 1" returns 2252 cards; 47 have a
  // power stat below 1.
  it.failing('D7 "power < 1" only returns cards that have a power stat', () => {
    expect(titles('power < 1')).toEqual(['2X-7KPR (Tooex)']);
  });
});
