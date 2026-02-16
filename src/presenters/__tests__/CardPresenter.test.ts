import CardPresenter from '../CardPresenter';
import Card from '../../models/Card';
import ExpansionSet from '../../models/ExpansionSet';
import { CardSide, CardUniqueness } from '../../types/enums';

// Mock Card and dependencies
const createMockCard = (overrides = {}) => {
  const mockExpansionSet = new ExpansionSet({
    id: '1',
    name: 'Test Set',
    abbr: 'TS',
    gempName: 'TestSet'
  });

  const mockCard = {
    id: '1_123',
    title: 'Test Card',
    type: 'Character',
    subtype: 'Rebel',
    side: CardSide.Light,
    expansionSetId: '1',
    expansionSet: mockExpansionSet,
    imageUrl: 'https://example.com/card.jpg',
    backImageUrl: 'https://example.com/card-back.jpg',

    ability: 3,
    armor: 2,
    dsicons: 0,
    deploy: 4,
    destiny: 2,
    ferocity: 1,
    forfeit: 5,
    hyperspeed: 3,
    landspeed: 2,
    lsicons: 1,
    maneuver: 2,
    parsec: 3,
    politics: 2,
    power: 4,

    extratext: 'May add 1 to power',
    gametext: 'This is test gametext',
    lore: 'Test lore text',

    characteristics: ['Test', 'Character'],
    icons: ['Pilot'],
    rarity: 'R',
    uniqueness: CardUniqueness.Unique,
    set: 'Test Set',

    identities: ['Character', 'Rebel', 'Pilot'],
    cancels: ['Card1', 'Card2'],
    canceledby: ['Card3'],
    matching: ['Ship1'],
    matchingweapon: ['Weapon1'],
    pulledby: ['Card4'],
    pulls: ['Card5'],
    counterpart: 'Card6',
    underlyingcardfor: 'Card7',
    abbr: ['TC', 'TestC'],

    sortTitle: 'test card',
    sortAbbr: ['tc', 'testc'],

    nameAndAliases: jest.fn(() => ['test card', 'tc', 'testc']),
    get: jest.fn((attr) => mockCard[attr]),
    getSanitized: jest.fn((attr) => {
      const val = mockCard[attr];
      if (typeof val === 'string') {
        return val.replaceAll(/[^a-zA-Z0-9 -]/g, '').toLowerCase().trim();
      }
      return val;
    })
  };

  return { ...mockCard, ...overrides };
};

describe('CardPresenter', () => {
  describe('constructor', () => {
    it('should create a CardPresenter instance with all properties from a card', () => {
      const mockCard = createMockCard();
      const presenter = new CardPresenter(mockCard as unknown as Card);

      expect(presenter.id).toBe('1_123');
      expect(presenter.title).toBe('Test Card');
      expect(presenter.type).toBe('Character');
      expect(presenter.subtype).toBe('Rebel');
      expect(presenter.side).toBe(CardSide.Light);
      expect(presenter.imageUrl).toBe('https://example.com/card.jpg');
      expect(presenter.backImageUrl).toBe('https://example.com/card-back.jpg');
      expect(presenter.rarity).toBe('R');
      expect(presenter.uniqueness).toBe(CardUniqueness.Unique);

      expect(presenter.displayTitle).toBe('Test Card');
      expect(presenter.displayType).toBe('Character');
      expect(presenter.displaySubtype).toBe('Rebel');
      expect(presenter.displayExpansionSet).toBe('Test Set');
    });

    it('should handle expansion set name transformations', () => {
      const mockCard = createMockCard({
        expansionSet: new ExpansionSet({
          id: '2',
          name: 'Reflections 2',
          abbr: 'R2',
          gempName: 'Reflections2'
        })
      });

      const presenter = new CardPresenter(mockCard as unknown as Card);
      expect(presenter.displayExpansionSet).toBe('Reflections II');

      const mockCard2 = createMockCard({
        expansionSet: new ExpansionSet({
          id: '3',
          name: 'Reflections 3',
          abbr: 'R3',
          gempName: 'Reflections3'
        })
      });

      const presenter2 = new CardPresenter(mockCard2 as unknown as Card);
      expect(presenter2.displayExpansionSet).toBe('Reflections III');

      const mockCard3 = createMockCard({
        expansionSet: new ExpansionSet({
          id: '4',
          name: 'Two Player',
          abbr: '2P',
          gempName: 'TwoPlayer'
        })
      });

      const presenter3 = new CardPresenter(mockCard3 as unknown as Card);
      expect(presenter3.displayExpansionSet).toBe('2-Player');
    });

    it('should format display title correctly', () => {
      // Long titles without split tokens remain unchanged
      const mockCardLongTitle = createMockCard({
        title: 'This is a very long title that should be broken into multiple lines because it exceeds 39 characters'
      });

      const presenterLongTitle = new CardPresenter(mockCardLongTitle as unknown as Card);
      expect(presenterLongTitle.displayTitle).toBe(mockCardLongTitle.title);

      // Test with an objective
      const mockCardObjective = createMockCard({
        type: 'Objective',
        title: 'Death Star Plans & Rebel Cover'
      });

      const presenterObjective = new CardPresenter(mockCardObjective as unknown as Card);
      expect(presenterObjective.displayTitle).toContain(' &\n');

      // Test with dual titles
      const mockCardDualTitle = createMockCard({
        title: 'First Title / First Title'
      });

      const presenterDualTitle = new CardPresenter(mockCardDualTitle as unknown as Card);
      expect(presenterDualTitle.displayTitle).toBe('First Title');

      // Test with version markers
      const mockCardVersioned = createMockCard({
        title: 'Luke Skywalker (Premiere)'
      });

      const presenterVersioned = new CardPresenter(mockCardVersioned as unknown as Card);
      expect(presenterVersioned.displayTitle.trim()).toBe('Luke Skywalker');
    });

    it('should handle sideways cards correctly', () => {
      // Site card (should be sideways)
      const mockSiteCard = createMockCard({
        subtype: 'Site'
      });

      const presenterSite = new CardPresenter(mockSiteCard as unknown as Card);
      expect(presenterSite.sideways).toBe(true);
      expect(presenterSite.height).toBe(339);
      expect(presenterSite.width).toBe(475);
      expect(presenterSite.aspectRatio).toBeCloseTo(0.714, 2); // 339/475 ≈ 0.714
      expect(presenterSite.offsetY).toBe(-30);
      expect(presenterSite.offsetHeight).toBe(30);

      // Other sideways card by ID
      const mockOtherSidewaysCard = createMockCard({
        id: '4_167'
      });

      const presenterOtherSideways = new CardPresenter(mockOtherSidewaysCard as unknown as Card);
      expect(presenterOtherSideways.sideways).toBe(true);

      // Non-sideways card
      const mockNormalCard = createMockCard();
      const presenterNormal = new CardPresenter(mockNormalCard as unknown as Card);
      expect(presenterNormal.sideways).toBe(false);
      expect(presenterNormal.height).toBe(475);
      expect(presenterNormal.width).toBe(339);
      expect(presenterNormal.aspectRatio).toBeCloseTo(1.401, 2); // 475/339 ≈ 1.401
    });

    it('should identify combo cards correctly', () => {
      // Combo card (Interrupt with &)
      const mockComboCard = createMockCard({
        title: 'Sense & Alter',
        type: 'Interrupt'
      });

      const presenterCombo = new CardPresenter(mockComboCard as unknown as Card);
      expect(presenterCombo.combo).toBe(true);
      expect(presenterCombo.offsetY).toBe(-5);
      expect(presenterCombo.offsetHeight).toBe(80);

      // Not a combo card (has & but wrong type)
      const mockNonComboCard = createMockCard({
        title: 'Luke & Leia',
        type: 'Character'
      });

      const presenterNonCombo = new CardPresenter(mockNonComboCard as unknown as Card);
      expect(presenterNonCombo.combo).toBe(false);

      // Special case non-combo
      const mockSpecialCase = createMockCard({
        id: '7_76',
        title: 'Something & Something',
        type: 'Effect'
      });

      const presenterSpecialCase = new CardPresenter(mockSpecialCase as unknown as Card);
      expect(presenterSpecialCase.combo).toBe(false);
    });

    it('should handle two-sided cards correctly', () => {
      // Two-sided card
      const mockTwoSidedCard = createMockCard({
        backImageUrl: 'https://example.com/back-side.jpg'
      });

      const presenterTwoSided = new CardPresenter(mockTwoSidedCard as unknown as Card);
      expect(presenterTwoSided.twoSided).toBe(true);

      // Special case double-sided card
      const mockSpecialTwoSided = createMockCard({
        id: '200_16'
      });

      const presenterSpecialTwoSided = new CardPresenter(mockSpecialTwoSided as unknown as Card);
      expect(presenterSpecialTwoSided.displayImageUrl).toBe(mockSpecialTwoSided.backImageUrl);
      expect(presenterSpecialTwoSided.displayBackImageUrl).toBe(mockSpecialTwoSided.imageUrl);
    });

    it('should treat cards with empty or whitespace-only backImageUrl as one-sided', () => {
      const mockNoBackImage = createMockCard({
        backImageUrl: '',
      });
      const presenterNoBackImage = new CardPresenter(mockNoBackImage as unknown as Card);
      expect(presenterNoBackImage.twoSided).toBe(false);

      const mockWhitespaceBackImage = createMockCard({
        backImageUrl: '   ',
      });
      const presenterWhitespaceBackImage = new CardPresenter(
        mockWhitespaceBackImage as unknown as Card,
      );
      expect(presenterWhitespaceBackImage.twoSided).toBe(false);
    });

    it('should handle special card types with different offsets', () => {
      // Test card
      const mockTestCard = createMockCard({
        type: 'Test Card'
      });

      const presenterTest = new CardPresenter(mockTestCard as unknown as Card);
      expect(presenterTest.offsetY).toBe(0);
      expect(presenterTest.offsetHeight).toBe(60);

      // Objective card
      const mockObjectiveCard = createMockCard({
        type: 'Objective'
      });

      const presenterObjective = new CardPresenter(mockObjectiveCard as unknown as Card);
      expect(presenterObjective.offsetY).toBe(-10);
      expect(presenterObjective.offsetHeight).toBe(60);
    });
  });
});
