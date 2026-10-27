import loadExpansionSets from '../LoadExpansionSets';
import loadCardDefinitions from '../LoadCardDefinitions';
import loadDecklists from '../LoadDecklists';
import ExpansionSet from '../../models/ExpansionSet';

const mockReadFile = jest.fn();

jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: {
      DocumentDir: '/tmp',
    },
    readFile: (...args: any[]) => mockReadFile(...args),
  },
}));

describe('loaders', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('loads expansion sets from array payload', async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        {
          id: '1',
          name: 'Premiere',
          gempName: 'Premiere',
          abbr: 'P',
          legacy: false,
        },
      ]),
    );

    const sets = await loadExpansionSets();
    expect(sets).toHaveLength(1);
    expect(sets[0].id).toBe('1');
  });

  it('loads expansion sets from wrapped payload', async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify({
        sets: [
          {
            id: '2',
            name: 'A New Set',
            gempName: 'A New Set',
            abbr: 'ANS',
            legacy: false,
          },
        ],
      }),
    );

    const sets = await loadExpansionSets();
    expect(sets).toHaveLength(1);
    expect(sets[0].id).toBe('2');
  });

  // Regression (2026-10-27): upstream started shipping "(ALT)" alternate-image
  // rows that reuse the original card's gempId. The card list keys rows by that
  // id, and duplicate keys made the list repeat rows and show stale results from
  // earlier searches.
  it('loads exactly one card per gempId, preferring the canonical printing', async () => {
    const row = (gempId: string, title: string, imageUrl = '') => ({
      gempId,
      side: 'Dark',
      set: '200',
      rarity: 'U',
      front: {title, type: 'Effect', subType: '', characteristics: [], icons: [], imageUrl},
    });
    const payload = JSON.stringify({
      cards: [
        row('200_109', '•Coarse And Rough And Irritating'),
        row('200_109', '•Coarse And Rough And Irritating (ALT)'),
        row('200_95', '•Fanfare (Tatooine) (V)'),
        row('200_95', '•Fanfare (V)'),
        row('200_1', '•Aayla Secura'),
        row('200_1', '•Aayla Secura (Holo AI)'),
        row('227_29', '•Qui-Gon Jinn (V) (ALT)'),
        row('227_22', '•Qui-Gon Jinn (V)'),
      ],
    });
    mockReadFile.mockImplementation((path: string) =>
      path.endsWith('/Dark.json') ? Promise.resolve(payload) : Promise.resolve(''),
    );

    const cards = await loadCardDefinitions([
      new ExpansionSet({id: '200', name: 'Virtual Set 0', gempName: 'Set 0', abbr: 'V0', legacy: false}),
    ]);

    const ids = cards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(cards.map(c => c.title).sort()).toEqual([
      '•Aayla Secura',
      '•Coarse And Rough And Irritating',
      '•Fanfare (V)',
      '•Qui-Gon Jinn (V)',
    ]);
    expect(consoleLogSpy).toHaveBeenCalledWith('[cards] collapsed 1 duplicate-id printings');
  });

  it('falls back to bundled fixtures for cards when local files are missing', async () => {
    mockReadFile.mockRejectedValue(new Error('No such file'));

    const expansionSets = [
      new ExpansionSet({
        id: '1',
        name: 'Premiere',
        gempName: 'Premiere',
        abbr: 'P',
        legacy: false,
      }),
    ];

    const cards = await loadCardDefinitions(expansionSets);
    expect(cards.length).toBeGreaterThan(0);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('suppresses expected missing-file errors when loading expansion sets', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('No such file'));

    const sets = await loadExpansionSets();
    expect(sets.length).toBeGreaterThan(0);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('suppresses expected missing-file errors when loading decklists', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('No such file'));

    const decklists = await loadDecklists();
    expect(decklists).toEqual([]);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('logs unexpected errors when loading expansion sets', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('Permission denied'));

    await loadExpansionSets();
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });
});
