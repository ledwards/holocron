import {
  countQueryHits,
  filterSectionsByQuery,
  findMatchingSectionIds,
  tokenizeQuery,
} from '../search';
import {RulesSearchIndex, RulesSection} from '../types';

const sections: RulesSection[] = [
  {
    id: 'intro',
    title: 'Introduction',
    level: 1,
    anchor: 'introduction',
    pageRef: 1,
    blocks: [],
  },
  {
    id: 'timing',
    title: 'Timing',
    level: 1,
    anchor: 'timing',
    pageRef: 5,
    blocks: [],
  },
  {
    id: 'actions',
    title: 'Actions',
    level: 1,
    anchor: 'actions',
    pageRef: 8,
    blocks: [],
  },
];

const index: RulesSearchIndex = {
  version: '1',
  tokenMap: {
    draw: [{sectionId: 'timing', sectionIndex: 1, blockIndex: 0, tokenPosition: 0}],
    phase: [{sectionId: 'timing', sectionIndex: 1, blockIndex: 0, tokenPosition: 1}],
    action: [{sectionId: 'actions', sectionIndex: 2, blockIndex: 0, tokenPosition: 0}],
    actions: [{sectionId: 'timing', sectionIndex: 1, blockIndex: 0, tokenPosition: 2}],
    circulate: [{sectionId: 'actions', sectionIndex: 2, blockIndex: 0, tokenPosition: 1}],
  },
};

describe('rules search helpers', () => {
  it('tokenizes query by words and strips punctuation', () => {
    expect(tokenizeQuery(' Draw, Phase! ')).toEqual(['draw', 'phase']);
  });

  it('finds section ids by AND token intersection', () => {
    expect(Array.from(findMatchingSectionIds(index, 'draw phase'))).toEqual([
      'timing',
    ]);
    expect(Array.from(findMatchingSectionIds(index, 'draw action'))).toEqual([]);
  });

  it('supports prefix matching for partial query tokens', () => {
    expect(Array.from(findMatchingSectionIds(index, 'circulat'))).toEqual([
      'actions',
    ]);
  });

  it('filters sections by index matches and title fallback', () => {
    const byIndex = filterSectionsByQuery(sections, index, 'draw');
    expect(byIndex.map(section => section.id)).toEqual(['timing']);

    const byTitle = filterSectionsByQuery(sections, index, 'intro');
    expect(byTitle.map(section => section.id)).toEqual(['intro']);
  });

  it('counts matching hits for the current query', () => {
    expect(countQueryHits(index, 'actions')).toBe(1);
    const sectionIds = findMatchingSectionIds(index, 'draw');
    expect(countQueryHits(index, 'draw', sectionIds)).toBe(1);
  });
});
