import Decklist from '../Decklist';
import Tournament from '../Tournament';
import Archetype from '../Archetype';
import Player from '../Player';

describe('Decklist', () => {
  const mockDecklistJSON = {
    slug: 'test-decklist',
    region: 'US',
    title: 'Test Decklist',
    url: 'https://example.com/decklist',
    date: '2023-05-15',
    side: 'Light',
    plaintext: 'This is a test decklist',
    cards: {
      'card1': 2,
      'card2': 1
    },
    tournament: {
      name: 'Test Tournament',
      shortName: 'TT',
      eventName: 'Championship Series',
      date: '2023-05-15',
      format: 'Standard',
      round: 'Final'
    },
    archetype: {
      name: 'Test Archetype',
      shortName: 'TA',
      aliases: ['Arch1', 'Arch2'],
      modifiers: ['Mod1', 'Mod2'],
      imageUrl: 'https://example.com/archetype.jpg',
      objective: 'Test Objective',
      startingLocation: 'Tatooine: Dune Sea',
      startingInterrupt: 'Clash Of Sabers'
    },
    player: {
      name: 'Test Player',
      aliases: ['Player1', 'Player2']
    }
  };

  describe('constructor', () => {
    it('should create a Decklist instance with all given parameters', () => {
      const decklist = new Decklist(mockDecklistJSON);
      
      expect(decklist.id).toBe('test-decklist-US');
      expect(decklist.title).toBe('Test Decklist');
      expect(decklist.slug).toBe('test-decklist');
      expect(decklist.url).toBe('https://example.com/decklist');
      expect(decklist.date).toBe('2023-05-15');
      expect(decklist.side).toBe('Light');
      expect(decklist.plaintext).toBe('This is a test decklist');
      expect(decklist.imageUrl).toBe('https://example.com/archetype.jpg');
      
      // Check nested objects
      expect(decklist.tournament).toBeInstanceOf(Tournament);
      expect(decklist.tournament.name).toBe('Test Tournament');
      
      expect(decklist.archetype).toBeInstanceOf(Archetype);
      expect(decklist.archetype.name).toBe('Test Archetype');
      
      expect(decklist.player).toBeInstanceOf(Player);
      expect(decklist.player.name).toBe('Test Player');
      
      // Check other properties
      expect(decklist.tournamentFormat).toBe('Standard');
      expect(decklist.tournamentRound).toBe('Final');
      expect(decklist.objective).toBe('Test Objective');
      expect(decklist.startingLocation).toBe('Tatooine: Dune Sea');
      expect(decklist.startingInterrupt).toBe('Clash Of Sabers');
      expect(decklist.cards).toEqual({ 'card1': 2, 'card2': 1 });
    });

    it('should handle missing optional parameters', () => {
      const minimalDecklistJSON = {
        slug: 'minimal-decklist',
        title: 'Minimal Decklist',
        url: 'https://example.com/minimal',
        date: '2023-06-20',
        side: 'Dark',
        plaintext: 'Minimal decklist text',
        cards: { 'card3': 3 },
        archetype: {
          name: 'Minimal Archetype',
          shortName: 'MA',
          aliases: [],
          modifiers: [],
          imageUrl: 'https://example.com/minimal.jpg'
        },
        player: {
          name: 'Minimal Player',
          aliases: []
        }
      };
      
      const decklist = new Decklist(minimalDecklistJSON);
      
      expect(decklist.id).toBe('minimal-decklist');
      expect(decklist.tournament.name).toBe('');
      expect(decklist.tournamentFormat).toBe('');
      expect(decklist.tournamentRound).toBe('');
      expect(decklist.objective).toBe('');
      expect(decklist.startingLocation).toBeNull();
      expect(decklist.startingInterrupt).toBeNull();
    });

    it('should handle tournament date conversion', () => {
      const decklist = new Decklist(mockDecklistJSON);
      expect(decklist.tournament.date).toBeInstanceOf(Date);
      expect(decklist.tournament.date.toISOString()).toContain('2023-05-15');
    });
  });

  describe('get', () => {
    it('should return the value of the specified attribute', () => {
      const decklist = new Decklist(mockDecklistJSON);
      
      expect(decklist.get('title')).toBe('Test Decklist');
      expect(decklist.get('side')).toBe('Light');
    });
  });

  describe('searchData', () => {
    it('should return a lowercase string containing all searchable data', () => {
      const decklist = new Decklist(mockDecklistJSON);
      const searchData = decklist.searchData();
      
      // Check that the search data includes important fields
      expect(searchData).toContain('test decklist');
      expect(searchData).toContain('test player');
      expect(searchData).toContain('test archetype');
      expect(searchData).toContain('test tournament');
      expect(searchData).toContain('final');
      
      // Should be lowercase
      expect(searchData).toBe(searchData.toLowerCase());
      
      // Should have no extra whitespace
      expect(searchData).not.toMatch(/\s{2,}/);
    });
    
    it('should handle missing data gracefully', () => {
      const minimalDecklistJSON = {
        slug: 'minimal-decklist',
        title: 'Minimal Decklist',
        url: 'https://example.com/minimal',
        date: '2023-06-20',
        side: 'Dark',
        plaintext: 'Minimal decklist text',
        cards: { 'card3': 3 },
        archetype: {
          name: 'Minimal Archetype',
          shortName: 'MA',
          aliases: [],
          modifiers: [],
          imageUrl: 'https://example.com/minimal.jpg'
        },
        player: {
          name: 'Minimal Player',
          aliases: []
        }
      };
      
      const decklist = new Decklist(minimalDecklistJSON);
      const searchData = decklist.searchData();
      
      expect(searchData).not.toContain('undefined');
      expect(searchData).toBeTruthy();
    });
  });
});
