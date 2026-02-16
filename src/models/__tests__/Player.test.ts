import Player from '../Player';

describe('Player', () => {
  describe('constructor', () => {
    it('should create a Player instance with the given parameters', () => {
      const params = {
        name: 'Test Player',
        aliases: ['Player1', 'Player2']
      };
      
      const player = new Player(params);
      
      expect(player.name).toBe('Test Player');
      expect(player.aliases).toEqual(['Player1', 'Player2']);
    });
    
    it('should handle empty aliases array', () => {
      const params = {
        name: 'Test Player',
        aliases: []
      };
      
      const player = new Player(params);
      
      expect(player.name).toBe('Test Player');
      expect(player.aliases).toEqual([]);
    });
  });
  
  describe('nameAndAliases', () => {
    it('should return an array containing the name and aliases sorted by length in descending order', () => {
      const player = new Player({
        name: 'John',
        aliases: ['Johnny', 'J']
      });
      
      const result = player.nameAndAliases();
      
      expect(result).toEqual(['Johnny', 'John', 'J']);
    });
    
    it('should handle a player with only a name and no aliases', () => {
      const player = new Player({
        name: 'Solo Player',
        aliases: []
      });
      
      const result = player.nameAndAliases();
      
      expect(result).toEqual(['Solo Player']);
    });
    
    it('should handle case where name and alias have same length', () => {
      const player = new Player({
        name: 'Luke',
        aliases: ['Mike', 'John']
      });
      
      const result = player.nameAndAliases();
      
      expect(result).toContain('Luke');
      expect(result).toContain('Mike');
      expect(result).toContain('John');
      expect(result.length).toBe(3);
    });
  });
});
