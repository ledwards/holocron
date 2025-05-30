import FilterQuery from '../../src/models/FilterQuery';
import Card from '../../src/models/Card';
import ExpansionSet from '../../src/models/ExpansionSet';
import { CardSide, CardUniqueness } from '../../src/types/enums';

describe('FilterQuery', () => {
  // Create sample test cards
  const createMockCard = (overrides = {}) => {
    const mockExpansionSet = new ExpansionSet({
      id: '1',
      name: 'Premiere',
      abbr: 'PR',
      gempName: 'Premiere'
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
      get: (attr) => overrides[attr] || defaults[attr],
      getSanitized: (attr) => {
        const val = overrides[attr] || defaults[attr];
        if (typeof val === 'string') {
          return val.replace(/[^a-zA-Z0-9 -]/g, '').toLowerCase().trim();
        }
        return val;
      }
    };
    
    return { ...defaults, ...overrides };
  };

  const card1 = createMockCard({
    id: '1_1',
    title: 'Luke Skywalker',
    power: 5,
    ability: 3,
    lore: 'Farmboy from Tatooine turned hero',
    icons: ['Pilot', 'Warrior'],
    characteristics: ['Character', 'Rebel', 'Jedi'],
    identities: ['Character', 'Rebel', 'Jedi', 'Pilot', 'Warrior'],
    type: 'Character',
    subtype: 'Rebel',
    side: CardSide.Light,
    expansionSet: new ExpansionSet({
      id: '1',
      name: 'Premiere',
      abbr: 'PR',
      gempName: 'Premiere'
    }),
    set: 'Premiere',
    rarity: 'R',
    matchingweapon: ['Lightsaber'],
    pulls: ['Obi-Wan Kenobi']
  });

  const card2 = createMockCard({
    id: '1_2',
    title: 'Darth Vader',
    power: 6,
    ability: 6,
    lore: 'Dark Lord of the Sith',
    icons: ['Pilot', 'Warrior'],
    characteristics: ['Character', 'Imperial', 'Sith'],
    identities: ['Character', 'Imperial', 'Sith', 'Pilot', 'Warrior'],
    type: 'Character',
    subtype: 'Imperial',
    side: CardSide.Dark,
    expansionSet: new ExpansionSet({
      id: '1',
      name: 'Premiere',
      abbr: 'PR',
      gempName: 'Premiere'
    }),
    set: 'Premiere',
    rarity: 'R',
    matchingweapon: ['Lightsaber'],
    cancels: ['Jedi Training']
  });

  const card3 = createMockCard({
    id: '1_3',
    title: 'X-Wing',
    power: 3,
    hyperspeed: 4,
    lore: 'Rebel starfighter',
    icons: ['Starfighter'],
    characteristics: ['Starship', 'Rebel'],
    identities: ['Starship', 'Rebel', 'Starfighter'],
    type: 'Starship',
    subtype: 'Rebel',
    side: CardSide.Light,
    expansionSet: new ExpansionSet({
      id: '2',
      name: 'A New Hope',
      abbr: 'ANH',
      gempName: 'ANewHope'
    }),
    set: 'A New Hope',
    rarity: 'C',
    matching: ['Red Squadron Pilot']
  });

  const card4 = createMockCard({
    id: '1_4',
    title: 'Force Push',
    lore: 'Use the Force to move objects',
    characteristics: ['Effect'],
    identities: ['Effect', 'Force'],
    type: 'Effect',
    side: CardSide.Light,
    expansionSet: new ExpansionSet({
      id: '3',
      name: 'Dagobah',
      abbr: 'Dag',
      gempName: 'Dagobah'
    }),
    set: 'Dagobah',
    rarity: 'U',
    gametext: 'Move target character away from you'
  });

  const allCards = [card1, card2, card3, card4];

  describe('Basic query parsing', () => {
    it('parses a simple equality query', () => {
      const query = 'title = Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('title');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('Luke Skywalker');
    });
    
    it('parses a query with no spaces around operator', () => {
      const query = 'title=Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('title');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('Luke Skywalker');
    });
    
    it('parses a query with alternate equals operator', () => {
      const query = 'title eq Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('title');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('Luke Skywalker');
    });

    it('parses a numeric comparison query', () => {
      const query = 'power > 5';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('power');
      expect(filterQuery.comparator?.name).toBe('greater than');
      expect(filterQuery.value).toBe('5');
    });
    
    it('parses a contains query', () => {
      const query = 'lore contains Tatooine';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('lore');
      expect(filterQuery.comparator?.name).toBe('contains');
      expect(filterQuery.value).toBe('Tatooine');
    });
    
    it('handles field aliases', () => {
      const query = 't = Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('title');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('Luke Skywalker');
    });
    
    it('handles comparator aliases', () => {
      const query = 'title c Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('title');
      expect(filterQuery.comparator?.name).toBe('contains');
      expect(filterQuery.value).toBe('Skywalker');
    });
  });

  describe('Default comparator handling', () => {
    it('uses default comparator when only field and value are provided', () => {
      const query = 'power 6';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('power');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('6');
    });
    
    it('uses default comparator with field alias', () => {
      const query = 'pwr 6';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.field?.name).toBe('power');
      expect(filterQuery.comparator?.name).toBe('equals');
      expect(filterQuery.value).toBe('6');
    });
    
    it('recognizes that default comparator is being used', () => {
      const query = 'power 6';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.usingDefaultComparator()).toBe(true);
    });
  });

  describe('Filter execution', () => {
    it('filters by title equality', () => {
      const query = 'title = Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
    
    it('filters by power greater than', () => {
      const query = 'power > 5';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Darth Vader');
    });
    
    it('filters by ability equality', () => {
      const query = 'ability = 3';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(2);
      expect(results.map(c => c.title)).toContain('Luke Skywalker');
      expect(results.map(c => c.title)).toContain('Test Card');
    });
    
    it('filters by lore containing text', () => {
      const query = 'lore contains Tatooine';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
    
    it('filters by side', () => {
      const query = 'side = Dark';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Darth Vader');
    });
    
    it('filters by type', () => {
      const query = 'type = Starship';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('X-Wing');
    });
    
    it('filters by set', () => {
      const query = 'set = Dagobah';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Force Push');
    });
    
    it('filters by characteristics containing value', () => {
      const query = 'characteristics contains Jedi';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
    
    it('filters by icons contains', () => {
      const query = 'icons contains Pilot';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(2);
      expect(results.map(c => c.title)).toContain('Luke Skywalker');
      expect(results.map(c => c.title)).toContain('Darth Vader');
    });
    
    it('filters with "is" identity query', () => {
      const query = 'is Jedi';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
    
    it('filters with "is" and contains operator', () => {
      const query = 'is c Jedi';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
  });

  describe('Query validation', () => {
    it('validates a well-formed query', () => {
      const query = 'title = Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.valid()).toBe(true);
      expect(filterQuery.validField()).toBe(true);
      expect(filterQuery.validComparator()).toBe(true);
      expect(filterQuery.validValue()).toBe(true);
      expect(filterQuery.validFilter()).toBe(true);
    });
    
    it('invalidates a query with unknown field', () => {
      const query = 'unknown = value';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.valid()).toBe(false);
      expect(filterQuery.validField()).toBe(false);
    });
    
    it('identifies partially valid comparator', () => {
      // Mocking a partial comparator in this test is difficult
      // as the parsing logic handles this internally
      const query = 'title eq Luke';
      const filterQuery = new FilterQuery(query);
      
      // This should be a valid comparator
      expect(filterQuery.validComparator()).toBe(true);
      expect(filterQuery.partiallyValidComparator()).toBe(false);
    });
    
    it('returns empty array for invalid queries', () => {
      const query = 'invalid query';
      const filterQuery = new FilterQuery(query);
      const results = filterQuery.execute(allCards);
      
      expect(results).toEqual([]);
    });
  });

  describe('Display methods', () => {
    it('gets display field name for normal fields', () => {
      const query = 'title = Luke';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.displayFieldName()).toBe('title');
    });
    
    it('gets display field name for identities field', () => {
      const query = 'identities contains Jedi';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.displayFieldName()).toBe('is');
    });
    
    it('gets display comparator name', () => {
      const query = 'title contains Luke';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.displayComparatorName()).toBe('contains');
    });
  });

  describe('Edge cases', () => {
    it('handles empty queries', () => {
      const query = '';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.valid()).toBe(false);
      expect(filterQuery.execute(allCards)).toEqual([]);
    });
    
    it('handles whitespace-only queries', () => {
      const query = '   ';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.valid()).toBe(false);
      expect(filterQuery.execute(allCards)).toEqual([]);
    });
    
    it('properly handles length method', () => {
      const query = 'title = Luke Skywalker';
      const filterQuery = new FilterQuery(query);
      
      expect(filterQuery.length(allCards)).toBe(1);
    });
  });
});