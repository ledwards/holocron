/**
 * The whole upstream card catalogue, pinned (src/data/__fixtures__/
 * upstream-cards.json.gz, refreshed by scripts/cards/refresh-upstream-corpus.py),
 * loaded through the REAL loaders and queried the way the app queries it.
 *
 * The 16-card fixture in query-audit.json cannot show every shape upstream
 * sends. On 2026-10-27 this corpus found three bugs the small fixture missed
 * ("title = luke skywalker" returning 11 cards, "m c falcon" breaking, and
 * three space-free clauses not splitting). Keep it in the default run.
 *
 *   npm run test:upstream                                # this file only
 *   UPDATE_UPSTREAM_COUNTS=1 npm run test:upstream       # rewrite recorded counts
 *
 * Only rewrite counts after reading every change; a changed count is either a
 * fix you meant or a regression.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import Card from '../Card';
import FilterQuerySet from '../FilterQuerySet';
import loadExpansionSets from '../../lib/LoadExpansionSets';
import loadCardDefinitions from '../../lib/LoadCardDefinitions';

const FIXTURES = path.join(__dirname, '../../data/__fixtures__');
const COUNTS_FILE = path.join(FIXTURES, 'upstream-query-counts.json');

const mockFiles: Record<string, string> = {};
jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: {DocumentDir: '/upstream'},
    readFile: (file: string) => Promise.resolve(mockFiles[file.replace('/upstream/', '')] || ''),
  },
}));

const corpus = JSON.parse(
  zlib.gunzipSync(fs.readFileSync(path.join(FIXTURES, 'upstream-cards.json.gz'))).toString('utf8'),
);
mockFiles['sets.json'] = JSON.stringify(corpus.sets);
mockFiles['Dark.json'] = JSON.stringify({cards: corpus.Dark});
mockFiles['Light.json'] = JSON.stringify({cards: corpus.Light});

const recorded = JSON.parse(fs.readFileSync(COUNTS_FILE, 'utf8'));
const queries: string[] = Object.keys(recorded.counts);

let cards: Card[] = [];
beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  cards = await loadCardDefinitions(await loadExpansionSets());
});
afterAll(() => {
  (console.log as jest.Mock).mockRestore?.();
});

// The app lowercases input before parsing (SearchableCardList.searchRouter).
const run = (query: string, list: Card[] = cards): string[] | 'INVALID' => {
  const set = new FilterQuerySet(query.toLowerCase(), list);
  return set.valid() ? set.execute(list).map(c => c.id).sort() : 'INVALID';
};
const count = (query: string) => {
  const ids = run(query);
  return ids === 'INVALID' ? 'INVALID' : ids.length;
};
const compact = (query: string) => query.replace(/\s+/g, '');

describe('upstream corpus: loading', () => {
  it('loads one card per gempId, with alternate-image rows removed', () => {
    const ids = cards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(cards.some(c => /\(ALT\)|\(.*AI.*\)/.test(c.title))).toBe(false);
    expect(cards).toHaveLength(3664);
  });
});

describe('upstream corpus: counts checked against an independent computation', () => {
  // Each number was computed from the raw JSON by separate Python code that
  // shares nothing with this parser (2026-10-27). They are facts about the
  // data, not snapshots of the app.
  it.each([
    ['power ≥ 6', 139],
    ['power >= 6', 139],
    ['set eq premiere', 324],
    ['set = premiere', 324],
    ['set c premiere', 336], // also "Premiere Introductory Two Player Game", "Enhanced Premiere"
    ['cancels c sense', 15],
    ['canceledby c sense', 11],
    ['title c commander', 24],
    ['title c hand', 17],
    ['landspeed > 2', 43],
    ['type = character', 1100],
    // stats a card does not have, and "*", are not numbers and never match
    ['power != 6', 1361],
    ['power < 1', 47],
    ['power under 2', 324],
    ['deploy = 0', 12],
    ['forfeit = 0', 27],
    ['ability = 0', 3],
    ['deploy<=2 and side=dark', 301],
  ])('%s → %i', (query, expected) => {
    expect(count(query)).toBe(expected);
  });
});

describe('upstream corpus: every recorded query', () => {
  const actual: Record<string, number | 'INVALID'> = {};

  it.each(queries)('%s', query => {
    actual[query] = count(query);
    if (!process.env.UPDATE_UPSTREAM_COUNTS) {
      expect(actual[query]).toBe(recorded.counts[query]);
    }
    // removing the spaces never changes which cards are found
    expect(run(compact(query))).toEqual(run(query));
  });

  afterAll(() => {
    if (process.env.UPDATE_UPSTREAM_COUNTS) {
      fs.writeFileSync(COUNTS_FILE, JSON.stringify({...recorded, counts: actual}, null, 1) + '\n');
    }
  });
});

describe('upstream corpus: caching', () => {
  // Every prefix of the space-free form, typed one key at a time with the
  // cache warm, against a cold run on a new list. The space-free form is
  // where readings compete and "and" splits, so it reaches every cached path;
  // spaced queries are checked whole. (Every prefix of both: 15s, same result.)
  it('cached results equal a cold run for every prefix as it is typed', () => {
    const mismatches: string[] = [];
    const check = (text: string) => {
      // [...cards] is a new list, so it starts with empty caches
      if (JSON.stringify(run(text)) !== JSON.stringify(run(text, [...cards]))) {
        mismatches.push(text);
      }
    };
    for (const query of queries) {
      const typed = compact(query);
      for (let i = 1; i <= typed.length; i++) {
        check(typed.slice(0, i));
      }
      check(query);
    }
    expect(mismatches).toEqual([]);
  });
});
