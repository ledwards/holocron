import Card from '../Card';
import ExpansionSet from '../ExpansionSet';
import {CardSide, CardUniqueness} from '../../types/enums';

describe('Card', () => {
  const mockExpansionSetJSON = {
    id: '1',
    name: 'Test Set',
    abbr: 'TS',
    gempName: 'TestSet',
  };

  const mockCardJSON = {
    gempId: '12345',
    front: {
      title: 'Test Card',
      type: 'Character',
      subType: 'Rebel',
      characteristics: ['Test', 'Character'],
      icons: ['Pilot'],
      ability: 3,
      armor: 2,
      darkSideIcons: 0,
      lightSideIcons: 1,
      deploy: 4,
      destiny: 2,
      ferocity: '1',
      forfeit: 5,
      hyperspeed: 3,
      landspeed: 2,
      maneuver: 2,
      parsec: 3,
      politics: 2,
      power: 4,
      gametext: 'This is test gametext',
      lore: 'Test lore text',
      extraText: ['May add 1 to power'],
      uniqueness: 'unique',
      imageUrl: 'https://example.com/card.jpg',
    },
    back: {
      gametext: 'This is back gametext',
      imageUrl: 'https://example.com/card-back.jpg',
      extraText: ['May subtract 1 from power'],
    },
    side: 'Light',
    set: '1',
    rarity: 'R',
    abbr: ['TC', 'TestC'],
    cancels: ['Card1', 'Card2'],
    canceledBy: ['Card3'],
    matching: ['Ship1'],
    matchingWeapon: ['Weapon1'],
    pulledBy: ['Card4'],
    pulls: ['Card5'],
    counterpart: 'Card6',
    underlyingCardFor: 'Card7',
  };

  describe('constructor', () => {
    it('should create a Card instance with all given parameters', () => {
      const card = new Card(mockCardJSON, mockExpansionSetJSON);

      expect(card.id).toBe('12345');
      expect(card.title).toBe('Test Card');
      expect(card.type).toBe('Character');
      expect(card.subtype).toBe('Rebel');
      expect(card.side).toBe(CardSide.Light);
      expect(card.expansionSetId).toBe('1');
      expect(card.imageUrl).toBe('https://example.com/card.jpg');
      expect(card.backImageUrl).toBe('https://example.com/card-back.jpg');

      // Numeric attributes
      expect(card.ability).toBe(3);
      expect(card.armor).toBe(2);
      expect(card.dsicons).toBe(0);
      expect(card.lsicons).toBe(1);
      expect(card.deploy).toBe(4);
      expect(card.destiny).toBe(2);
      expect(card.ferocity).toBe(1);
      expect(card.forfeit).toBe(5);

      // Text attributes
      expect(card.gametext).toContain('This is test gametext');
      expect(card.gametext).toContain('This is back gametext');
      expect(card.lore).toBe('Test lore text');
      expect(card.extratext).toContain('May add 1 to power');
      expect(card.extratext).toContain('May subtract 1 from power');

      // Arrays
      expect(card.characteristics).toEqual(['Test', 'Character']);
      expect(card.icons).toEqual(['Pilot']);
      expect(card.abbr).toEqual(['TC', 'TestC']);

      // Relations
      expect(card.cancels).toEqual(['Card1', 'Card2']);
      expect(card.canceledby).toEqual(['Card3']);
      expect(card.matching).toEqual(['Ship1']);
      expect(card.counterpart).toBe('Card6');

      // ExpansionSet
      expect(card.expansionSet).toBeInstanceOf(ExpansionSet);
      expect(card.set).toBe('Test Set');
    });

    it('should handle card without a back side', () => {
      const singleSidedCard = {
        ...mockCardJSON,
        back: undefined,
      };

      const card = new Card(singleSidedCard, mockExpansionSetJSON);

      expect(card.backImageUrl).toBe('');
      expect(card.gametext).toBe('This is test gametext / ');
    });

    // Changed 2026-10-27 (audit defect D7): a missing stat used to read as 0,
    // so "power < 1" matched every Effect and Interrupt. Absent stays absent.
    it('leaves stats the card does not have undefined, not 0', () => {
      const minimalCardJSON = {
        gempId: '67890',
        front: {
          title: 'Minimal Card',
          type: 'Effect',
          subType: '',
          characteristics: [],
          icons: [],
          imageUrl: 'https://example.com/minimal.jpg',
        },
        side: 'Dark',
        set: '1',
        rarity: 'C',
      };

      const card = new Card(minimalCardJSON, mockExpansionSetJSON);

      expect(card.ability).toBeUndefined();
      expect(card.armor).toBeUndefined();
      expect(card.deploy).toBeUndefined();
      expect(card.destiny).toBeUndefined();
      expect(card.ferocity).toBeUndefined();
      expect(card.forfeit).toBeUndefined();
    });

    it('should normalize numeric gempId values to strings', () => {
      const numericIdCardJSON = {
        ...mockCardJSON,
        gempId: 96 as unknown as string,
      };

      const card = new Card(numericIdCardJSON, mockExpansionSetJSON);
      expect(card.id).toBe('96');
    });
  });

  describe('nameAndAliases', () => {
    it('should return an array with the sorted title and abbreviations', () => {
      const card = new Card(mockCardJSON, mockExpansionSetJSON);

      const result = card.nameAndAliases();

      expect(result).toContain('test card');
      expect(result).toContain('tc');
      expect(result).toContain('testc');
      expect(result.length).toBe(3);
    });

    it('should handle cards without abbreviations', () => {
      const noAbbrCard = {
        ...mockCardJSON,
        abbr: [],
      };

      const card = new Card(noAbbrCard, mockExpansionSetJSON);
      const result = card.nameAndAliases();

      expect(result).toEqual(['test card']);
    });
  });

  describe('get', () => {
    it('should return the value of the specified attribute', () => {
      const card = new Card(mockCardJSON, mockExpansionSetJSON);

      expect(card.get('title')).toBe('Test Card');
      expect(card.get('type')).toBe('Character');
      expect(card.get('ability')).toBe(3);
    });
  });

  describe('getSanitized', () => {
    it('should return sanitized string values', () => {
      const card = new Card(mockCardJSON, mockExpansionSetJSON);

      expect(card.getSanitized('title')).toBe('test card');

      // Test with special characters
      card.title = "Luke's Lightsaber";
      expect(card.getSanitized('title')).toBe('lukes lightsaber');
    });

    it('should return non-string values as is', () => {
      const card = new Card(mockCardJSON, mockExpansionSetJSON);

      expect(card.getSanitized('ability')).toBe(3);
      expect(card.getSanitized('characteristics')).toEqual([
        'Test',
        'Character',
      ]);
    });
  });
});
