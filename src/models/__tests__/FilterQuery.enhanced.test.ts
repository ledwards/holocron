import FilterQuery from '../FilterQuery';
import Card from '../Card';
import ExpansionSet from '../ExpansionSet';
import {CardSide, CardUniqueness} from '../../types/enums';

describe('FilterQuery enhanced behavior', () => {
  const createMockCard = (overrides = {}) => {
    const mockExpansionSet = new ExpansionSet({
      id: '1',
      name: 'Premiere',
      abbr: 'PR',
      gempName: 'Premiere',
    });

    const defaults = {
      id: '1_123',
      title: 'Test Card',
      type: 'Character',
      subtype: 'Rebel',
      side: CardSide.Light,
      expansionSetId: '1',
      expansionSet: mockExpansionSet,
      imageUrl: 'https://example.com/card.jpg',
      backImageUrl: '',
      ability: 3,
      armor: 0,
      dsicons: 0,
      deploy: 4,
      destiny: 2,
      ferocity: 0,
      forfeit: 5,
      hyperspeed: 0,
      landspeed: 0,
      lsicons: 1,
      maneuver: 0,
      parsec: 0,
      politics: 0,
      power: 3,
      extratext: '',
      gametext: 'Test gametext',
      lore: 'Test lore text',
      characteristics: ['Character', 'Rebel'],
      icons: ['Warrior'],
      rarity: 'R',
      uniqueness: CardUniqueness.Unique,
      set: 'Premiere',
      identities: ['Character', 'Rebel', 'Warrior'],
      cancels: [],
      canceledby: [],
      matching: [],
      matchingweapon: [],
      pulledby: [],
      pulls: [],
      counterpart: '',
      underlyingcardfor: '',
      abbr: ['TC'],
      sortTitle: 'test card',
      sortAbbr: ['tc'],
      nameAndAliases: () => ['test card', 'tc'],
      get: (attr: string) => (overrides as any)[attr] ?? (defaults as any)[attr],
      getSanitized: (attr: string) => {
        const val = (overrides as any)[attr] ?? (defaults as any)[attr];
        return typeof val === 'string'
          ? val.replace(/[^a-zA-Z0-9 -]/g, '').toLowerCase().trim()
          : val;
      },
    };

    return {...defaults, ...overrides};
  };

  const allCards = [
    createMockCard({
      id: '1_1',
      title: 'Luke Skywalker',
      power: 5,
      ability: 3,
      lore: 'Farmboy from Tatooine turned hero',
      icons: ['Pilot', 'Warrior'],
      type: 'Character',
      side: CardSide.Light,
    }),
    createMockCard({
      id: '1_2',
      title: 'Darth Vader',
      power: 6,
      ability: 6,
      gametext: 'Vader may cancel one battle destiny just drawn.',
      lore: 'Dark Lord of the Sith',
      icons: ['Pilot', 'Warrior'],
      type: 'Character',
      side: CardSide.Dark,
    }),
    createMockCard({
      id: '1_3',
      title: 'X-Wing',
      type: 'Starship',
      side: CardSide.Light,
      icons: ['Starfighter'],
      lore: 'Rebel starfighter',
    }),
  ] as unknown as Card[];

  it('parses field and comparator for equals query', () => {
    const filterQuery = new FilterQuery('title = Luke Skywalker');

    expect(filterQuery.field?.name).toBe('title');
    expect(filterQuery.comparator?.name).toBe('=');
    expect(filterQuery.value).toBe('Luke Skywalker');
    expect(filterQuery.valid()).toBe(true);
  });

  it('matches lore contains query', () => {
    const filterQuery = new FilterQuery('lore contains Tatooine');
    const results = filterQuery.execute(allCards);

    expect(results.map(c => c.title)).toEqual(['Luke Skywalker']);
  });

  it('does not alias-resolve free-text values for gametext contains', () => {
    const filterQuery = new FilterQuery('gt c vader');
    const results = filterQuery.execute(allCards);

    expect(filterQuery.valid()).toBe(true);
    expect(results.map(c => c.title)).toEqual(['Darth Vader']);
  });

  it('matches numeric greater-than query', () => {
    const filterQuery = new FilterQuery('power > 5');
    const results = filterQuery.execute(allCards);

    expect(results.map(c => c.title)).toEqual(['Darth Vader']);
  });

  it('returns empty results for invalid query', () => {
    const filterQuery = new FilterQuery('zzzzz = value');
    expect(filterQuery.valid()).toBe(false);
    expect(filterQuery.execute(allCards)).toEqual([]);
  });
});
