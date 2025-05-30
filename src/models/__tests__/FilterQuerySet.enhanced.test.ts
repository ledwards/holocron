import FilterQuerySet from '../FilterQuerySet';
import Card from '../Card';
import ExpansionSet from '../ExpansionSet';
import { CardSide, CardUniqueness } from '../../types/enums';

describe('FilterQuerySet', () => {
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
    rarity: 'R'
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
    rarity: 'R'
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
    rarity: 'C'
  });

  const card4 = createMockCard({
    id: '1_4',
    title: 'Force Push',
    lore: 'Use the Force to move objects',
    characteristics: ['Effect', 'Force'],
    identities: ['Effect', 'Force'],
    type: 'Effect',
    side: CardSide.Light,
    rarity: 'U'
  });

  const allCards = [card1, card2, card3, card4];

  describe('Query Parsing', () => {
    it('parses a single query string', () => {
      const query = 'title = Luke Skywalker';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(1);
      expect(filterQuerySet.filterQueries[0].field?.name).toBe('title');
      expect(filterQuerySet.filterQueries[0].comparator?.name).toBe('equals');
      expect(filterQuerySet.filterQueries[0].value).toBe('Luke Skywalker');
    });
    
    it('parses a compound query string with AND', () => {
      const query = 'title = Luke Skywalker and type = Character';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(2);
      expect(filterQuerySet.filterQueries[0].field?.name).toBe('title');
      expect(filterQuerySet.filterQueries[0].value).toBe('Luke Skywalker');
      expect(filterQuerySet.filterQueries[1].field?.name).toBe('type');
      expect(filterQuerySet.filterQueries[1].value).toBe('Character');
    });
    
    it('parses multiple ANDs in a query', () => {
      const query = 'title = Luke Skywalker and type = Character and side = Light';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(3);
      expect(filterQuerySet.filterQueries[0].field?.name).toBe('title');
      expect(filterQuerySet.filterQueries[1].field?.name).toBe('type');
      expect(filterQuerySet.filterQueries[2].field?.name).toBe('side');
    });
    
    it('handles case insensitivity for AND operator', () => {
      const query = 'title = Luke Skywalker AND type = Character';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(2);
    });
    
    it('handles empty queries', () => {
      const query = '';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(1);
      expect(filterQuerySet.filterQueries[0].valid()).toBe(false);
    });
    
    it('handles whitespace-only queries', () => {
      const query = '   ';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.filterQueries.length).toBe(1);
      expect(filterQuerySet.filterQueries[0].valid()).toBe(false);
    });
  });

  describe('Query Validation', () => {
    it('validates a well-formed query set', () => {
      const query = 'title = Luke Skywalker and type = Character';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.valid()).toBe(true);
    });
    
    it('invalidates a query set with one invalid query', () => {
      const query = 'title = Luke Skywalker and invalid = query';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.valid()).toBe(false);
    });
    
    it('returns correct length for a query set', () => {
      const query = 'title = Luke Skywalker and type = Character and side = Light';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.length()).toBe(3);
    });
    
    it('calculates correct view height for single query', () => {
      const query = 'title = Luke Skywalker';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.viewHeight()).toBe(70); // 45 + 25*1
    });
    
    it('calculates correct view height for multiple queries', () => {
      const query = 'title = Luke Skywalker and type = Character';
      const filterQuerySet = new FilterQuerySet(query);
      
      expect(filterQuerySet.viewHeight()).toBe(130); // 45 + 25*2 + 35
    });
  });

  describe('Filter Execution', () => {
    it('executes a single query correctly', () => {
      const query = 'title = Luke Skywalker';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Luke Skywalker');
    });
    
    it('executes a compound query correctly (AND logic)', () => {
      const query = 'type = Character and side = Light';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(2);
      expect(results.map(c => c.title)).toContain('Luke Skywalker');
      expect(results.map(c => c.title)).toContain('Test Card');
    });
    
    it('returns intersection of multiple filter results', () => {
      const query = 'type = Character and icons contains Pilot';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(2);
      expect(results.map(c => c.title)).toContain('Luke Skywalker');
      expect(results.map(c => c.title)).toContain('Darth Vader');
    });
    
    it('returns empty array when filters have no common results', () => {
      const query = 'title = Luke Skywalker and title = Darth Vader';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(0);
    });
    
    it('returns empty array for invalid query set', () => {
      const query = 'invalid query format';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(0);
    });
    
    it('handles complex compound queries', () => {
      const query = 'type = Character and side = Light and icons contains Warrior';
      const filterQuerySet = new FilterQuerySet(query);
      const results = filterQuerySet.execute(allCards);
      
      expect(results.length).toBe(2);
      expect(results.map(c => c.title)).toContain('Luke Skywalker');
      expect(results.map(c => c.title)).toContain('Test Card');
    });
  });
});