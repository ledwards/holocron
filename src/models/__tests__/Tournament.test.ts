import Tournament from '../Tournament';

describe('Tournament', () => {
  describe('constructor', () => {
    it('should create a Tournament instance with the given parameters', () => {
      const params = {
        url: 'https://example.com/tournament/1',
        slug: 'tournament-1',
        name: 'Test Tournament',
        shortName: 'TT',
        eventName: 'Championship Series',
        date: new Date('2023-05-15')
      };
      
      const tournament = new Tournament(params);
      
      expect(tournament.url).toBe('https://example.com/tournament/1');
      expect(tournament.slug).toBe('tournament-1');
      expect(tournament.name).toBe('Test Tournament');
      expect(tournament.shortName).toBe('TT');
      expect(tournament.eventName).toBe('Championship Series');
      expect(tournament.date).toEqual(new Date('2023-05-15'));
      expect(tournament.aliases).toEqual([]);
    });
    
    it('should initialize aliases as an empty array', () => {
      const params = {
        url: 'https://example.com/tournament/2',
        slug: 'tournament-2',
        name: 'Another Tournament',
        shortName: 'AT',
        eventName: 'Regional Qualifier',
        date: new Date('2023-06-20')
      };
      
      const tournament = new Tournament(params);
      
      expect(tournament.aliases).toEqual([]);
    });
  });
  
  describe('nameAndAliases', () => {
    it('should return an array containing the name and aliases sorted by length in descending order', () => {
      const tournament = new Tournament({
        url: 'https://example.com/tournament/3',
        slug: 'tournament-3',
        name: 'World Championship',
        shortName: 'WC',
        eventName: 'Global Series',
        date: new Date('2023-07-10')
      });
      
      // Manually set some aliases for testing
      tournament.aliases = ['World Finals', 'WCH'];
      
      const result = tournament.nameAndAliases();
      
      expect(result).toEqual(['World Championship', 'World Finals', 'WCH']);
    });
    
    it('should handle a tournament with only a name and no aliases', () => {
      const tournament = new Tournament({
        url: 'https://example.com/tournament/4',
        slug: 'tournament-4',
        name: 'Local Tournament',
        shortName: 'LT',
        eventName: 'Community Series',
        date: new Date('2023-08-05')
      });
      
      const result = tournament.nameAndAliases();
      
      expect(result).toEqual(['Local Tournament']);
    });
  });
});
