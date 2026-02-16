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
