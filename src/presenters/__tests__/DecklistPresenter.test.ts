import DecklistPresenter from '../DecklistPresenter';
import Decklist from '../../models/Decklist';
import Archetype from '../../models/Archetype';
import Player from '../../models/Player';
import Tournament from '../../models/Tournament';

// Mock Decklist and dependencies
const createMockDecklist = (overrides = {}) => {
  const mockArchetype = new Archetype({
    name: 'Test Archetype',
    shortName: 'TA',
    aliases: ['Arch1', 'Arch2'],
    modifiers: ['Mod1', 'Mod2']
  });
  
  const mockPlayer = new Player({
    name: 'Test Player',
    aliases: ['Player1', 'Player2']
  });
  
  const mockTournament = new Tournament({
    url: 'https://example.com/tournament',
    slug: 'test-tournament',
    name: 'Test Tournament',
    shortName: 'TT',
    eventName: 'Championship Series',
    date: new Date('2023-05-15')
  });
  
  const mockDecklist = {
    id: 'test-decklist-US',
    slug: 'test-decklist',
    title: 'Test Decklist',
    url: 'https://example.com/decklist',
    date: '2023-05-15',
    side: 'Light',
    plaintext: 'This is a test decklist',
    imageUrl: 'https://example.com/archetype.jpg',
    tournament: mockTournament,
    tournamentFormat: 'Standard',
    tournamentRound: 'Final',
    archetype: mockArchetype,
    objective: 'Test Objective',
    startingLocation: 'Tatooine: Dune Sea',
    startingInterrupt: 'Clash Of Sabers',
    player: mockPlayer,
    cards: { 'card1': 2, 'card2': 1 },
    get: jest.fn((attr) => mockDecklist[attr]),
    searchData: jest.fn(() => 'test decklist player archetype tournament')
  };
  
  return { ...mockDecklist, ...overrides };
};

describe('DecklistPresenter', () => {
  describe('constructor', () => {
    it('should create a DecklistPresenter instance with all properties from a decklist', () => {
      const mockDecklist = createMockDecklist();
      const presenter = new DecklistPresenter(mockDecklist as unknown as Decklist);
      
      expect(presenter.slug).toBe('test-decklist');
      expect(presenter.url).toBe('https://example.com/decklist');
      expect(presenter.date).toBe('2023-05-15');
      expect(presenter.title).toBe('Test Decklist');
      expect(presenter.side).toBe('Light');
      expect(presenter.tournamentRound).toBe('Final');
      expect(presenter.imageUrl).toBe('https://example.com/archetype.jpg');
      expect(presenter.plaintext).toBe('This is a test decklist');
      
      expect(presenter.displayTitle).toBe('Test Archetype');
      expect(presenter.hasObjective).toBe(true);
      expect(presenter.hasStartingSite).toBe(true);
    });
    
    it('should handle minimal decklist data', () => {
      const minimalDecklist = createMockDecklist({
        objective: '',
        startingLocation: null,
        tournamentRound: '',
        player: { name: 'Minimal Player', nameAndAliases: () => ['Minimal Player'] }
      });
      
      const presenter = new DecklistPresenter(minimalDecklist as unknown as Decklist);
      
      expect(presenter.hasObjective).toBe(false);
      expect(presenter.hasStartingSite).toBe(false);
      expect(presenter.displaySubtitle).toContain('Test Tournament');
      expect(presenter.displaySubtitle).toContain('Minimal Player');
    });
    
    it('should handle decklist with null objects', () => {
      const nullDecklist = createMockDecklist({
        archetype: null,
        player: null,
        tournament: null,
        objective: null,
        startingLocation: null
      });
      
      const presenter = new DecklistPresenter(nullDecklist as unknown as Decklist);
      
      expect(presenter.displayTitle).toBe('Unknown Archetype');
      expect(presenter.searchPlayerName).toBe('');
      expect(presenter.searchArchetypeName).toBe('');
      expect(presenter.hasObjective).toBe(false);
      expect(presenter.hasStartingSite).toBe(false);
    });
    
    it('should handle decklist with missing nameAndAliases methods', () => {
      const brokenDecklist = createMockDecklist({
        archetype: { name: 'Broken Archetype' },
        player: { name: 'Broken Player' }
      });
      
      const presenter = new DecklistPresenter(brokenDecklist as unknown as Decklist);
      
      expect(presenter.searchPlayerName).toBe('Broken Player');
      expect(presenter.searchArchetypeName).toBe('Broken Archetype');
    });
    
    it('should calculate correct dimensions for sideways cards', () => {
      const mockDecklist = createMockDecklist({
        objective: 'Some Objective'
      });
      const presenter = new DecklistPresenter(mockDecklist as unknown as Decklist);
      
      expect(presenter.sideways).toBe(true);
      expect(presenter.height).toBe(339);
      expect(presenter.width).toBe(475);
      expect(presenter.aspectRatio).toBeCloseTo(0.714, 2); // 339/475 ≈ 0.714
    });
    
    it('should calculate correct dimensions for non-sideways cards', () => {
      const mockDecklist = createMockDecklist({
        objective: ''
      });
      const presenter = new DecklistPresenter(mockDecklist as unknown as Decklist);
      
      expect(presenter.sideways).toBe(false);
      expect(presenter.height).toBe(475);
      expect(presenter.width).toBe(339);
      expect(presenter.aspectRatio).toBeCloseTo(1.401, 2); // 475/339 ≈ 1.401
    });
    
    it('should calculate correct offsets for different card types', () => {
      // Card with starting site
      const withStartingSite = createMockDecklist({
        startingLocation: 'Tatooine: Dune Sea'
      });
      const presenter1 = new DecklistPresenter(withStartingSite as unknown as Decklist);
      expect(presenter1.offsetY).toBe(-30);
      expect(presenter1.offsetHeight).toBe(30);
      
      // Card with objective but no starting site
      const withObjectiveOnly = createMockDecklist({
        objective: 'Test Objective',
        startingLocation: null
      });
      const presenter2 = new DecklistPresenter(withObjectiveOnly as unknown as Decklist);
      expect(presenter2.offsetY).toBe(0);
      expect(presenter2.offsetHeight).toBe(0);
      
      // Card with neither
      const withNeither = createMockDecklist({
        objective: '',
        startingLocation: null
      });
      const presenter3 = new DecklistPresenter(withNeither as unknown as Decklist);
      expect(presenter3.offsetY).toBe(0);
      expect(presenter3.offsetHeight).toBe(0);
    });
  });
});