import ExpansionSet from '../ExpansionSet';

describe('ExpansionSet', () => {
  describe('constructor', () => {
    it('should create an ExpansionSet instance with the given parameters', () => {
      const params = {
        id: '1',
        name: 'Premiere',
        abbr: 'PR',
        gempName: 'Premiere'
      };
      
      const expansionSet = new ExpansionSet(params);
      
      expect(expansionSet.id).toBe('1');
      expect(expansionSet.name).toBe('Premiere');
      expect(expansionSet.abbr).toBe('PR');
      expect(expansionSet.gempName).toBe('Premiere');
    });
    
    it('should handle different name and gempName', () => {
      const params = {
        id: '2',
        name: 'A New Hope',
        abbr: 'ANH',
        gempName: 'ANewHope'
      };
      
      const expansionSet = new ExpansionSet(params);
      
      expect(expansionSet.name).toBe('A New Hope');
      expect(expansionSet.gempName).toBe('ANewHope');
    });
  });
  
  describe('nameAndAliases', () => {
    it('should return an array containing the name, gempName, and abbreviation', () => {
      const expansionSet = new ExpansionSet({
        id: '3',
        name: 'Death Star II',
        abbr: 'DS2',
        gempName: 'DeathStarII'
      });
      
      const result = expansionSet.nameAndAliases();
      
      expect(result).toEqual(['Death Star II', 'DeathStarII', 'DS2']);
    });
    
    it('should handle case where name and gempName are the same', () => {
      const expansionSet = new ExpansionSet({
        id: '4',
        name: 'Jedi Pack',
        abbr: 'JP',
        gempName: 'Jedi Pack'
      });
      
      const result = expansionSet.nameAndAliases();
      
      expect(result).toEqual(['Jedi Pack', 'Jedi Pack', 'JP']);
    });
  });
});
