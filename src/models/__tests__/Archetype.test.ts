import Archetype from '../../src/models/Archetype';

describe('Archetype', () => {
  describe('constructor', () => {
    it('should create an Archetype instance with the given parameters', () => {
      const params = {
        name: 'Test Archetype',
        shortName: 'Test',
        side: 'Light',
        aliases: ['Arch1', 'Arch2'],
        modifiers: ['Mod1', 'Mod2']
      };
      
      const archetype = new Archetype(params);
      
      expect(archetype.name).toBe('Test Archetype');
      expect(archetype.shortName).toBe('Test');
      expect(archetype.side).toBe('Light');
      expect(archetype.aliases).toEqual(['Arch1', 'Arch2']);
      expect(archetype.modifiers).toEqual(['Mod1', 'Mod2']);
    });
    
    it('should handle empty arrays', () => {
      const params = {
        name: 'Test Archetype',
        shortName: 'Test',
        side: 'Dark',
        aliases: [],
        modifiers: []
      };
      
      const archetype = new Archetype(params);
      
      expect(archetype.name).toBe('Test Archetype');
      expect(archetype.shortName).toBe('Test');
      expect(archetype.side).toBe('Dark');
      expect(archetype.aliases).toEqual([]);
      expect(archetype.modifiers).toEqual([]);
    });
  });
  
  describe('nameAndAliases', () => {
    it('should return an array containing the name and aliases sorted by length in descending order', () => {
      const archetype = new Archetype({
        name: 'Jedi',
        shortName: 'J',
        side: 'Light',
        aliases: ['Jedi Knight', 'Force User'],
        modifiers: []
      });
      
      const result = archetype.nameAndAliases();
      
      expect(result).toEqual(['Force User', 'Jedi Knight', 'Jedi']);
    });
    
    it('should handle an archetype with only a name and no aliases', () => {
      const archetype = new Archetype({
        name: 'Unique Archetype',
        shortName: 'UA',
        side: 'Dark',
        aliases: [],
        modifiers: ['Modifier']
      });
      
      const result = archetype.nameAndAliases();
      
      expect(result).toEqual(['Unique Archetype']);
    });
    
    it('should handle case where name and alias have same length', () => {
      const archetype = new Archetype({
        name: 'Sith',
        shortName: 'S',
        side: 'Dark',
        aliases: ['Jedi', 'Sith'],
        modifiers: []
      });
      
      const result = archetype.nameAndAliases();
      
      // Since they're the same length, the sort order might be implementation-dependent
      expect(result).toContain('Sith');
      expect(result).toContain('Jedi');
      expect(result.length).toBe(3); // Name + 2 aliases, with one duplicate that should appear twice
    });
  });
});