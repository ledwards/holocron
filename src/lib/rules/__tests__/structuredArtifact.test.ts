import {RulesDocument} from '../types';
import documentData from '../../../data/rules/rules.document.json';
import {buildRulesSearchIndex, buildSearchPreviews, filterSectionsByQuery, rulesBlockText} from '../search';

const document = documentData as RulesDocument;

describe('source-preserving rules artifact', () => {
  it('covers every content page with unique anchors and exact styled-span text', () => {
    expect(document.extractionFormat).toBe('pdf-spans-v1');
    expect(new Set(document.sections.map(s => s.anchor)).size).toBe(document.sections.length);
    const pages = new Set<number>();
    for (const section of document.sections) {
      for (const block of section.blocks) {
        pages.add(block.pageRef || section.pageRef);
        if (block.type !== 'image') {
          expect(block.text).toBe(block.textRuns.map(run => run.text).join(''));
          expect(block.text).not.toMatch(/Not Endorsed or Sponsored by Lucasfilm/);
          expect(block.text).not.toMatch(/[\uE000-\uF8FF\uFFFD]/);
        }
      }
    }
    expect([...pages].sort((a, b) => a - b)).toEqual(Array.from({length: 179}, (_, i) => i + 8));
    for (const entry of document.toc) {
      expect(document.sections.some(s => s.anchor === entry.anchor && s.title === entry.title)).toBe(true);
    }
  });

  it('keeps the original page 9 headings, italic definition, column order and diagram', () => {
    const sections = document.sections.filter(s => s.pageRef === 9);
    expect(sections[0].title).toBe('Chapter 1 - Basics - Force, Actions, States, etc.');
    expect(sections[1].title).toBe('Section A. Force, Decks, Piles, & The Table');
    const life = sections.find(s => s.title === 'Life Force')!;
    expect(life.level).toBe(3);
    expect(life.blocks[1].textRuns[0]).toEqual({text: 'Your Reserve Deck, Force Pile and Used Pile.', italic: true});
    expect(sections.findIndex(s => s.title === 'Hand')).toBeLessThan(sections.findIndex(s => s.title === 'Re-circulating'));
    expect(sections.flatMap(s => s.blocks).some(b => b.type === 'image' && b.image?.page === 9)).toBe(true);
  });

  it('preserves separate bullet paragraphs and the wrapped Example 2 heading', () => {
    const section = document.sections.find(s => s.title === 'Empty Deck Or Pile')!;
    const bullets = section.blocks.filter(b => b.listItem);
    expect(bullets).toHaveLength(5);
    expect(bullets[0].text).toBe('• initiate any action that deploys, takes, exchanges or steals a card (or cards) from that deck or pile;');
    const result = buildSearchPreviews(document.sections, 'vader')[0];
    expect(result.sectionTitle).toBe('Revealing Cards From A Deck, Pile, Or Stack - Example 2');
    expect(result.snippet).toContain('first and uses its');
    expect(result.pageRef).toBe(10);
  });

  it('retains all three maintenance icons as source images with accessible labels', () => {
    const symbols = document.sections.flatMap(s => s.blocks.flatMap(b => b.textRuns.filter(r => r.symbol)));
    expect(new Set(symbols.map(r => r.symbol!.label))).toEqual(new Set(['Maintain', 'Recycle', 'Sacrifice']));
    expect(symbols.every(r => r.symbol!.uri.startsWith('data:image/png;base64,'))).toBe(true);
  });

  it('keeps symbol legends together and their wording searchable', () => {
    const section = document.sections.find(s => s.id === 'icons-maintenance-cards')!;
    const legend = section.blocks.find(b => b.type === 'image')!;
    expect(legend.image?.uri).toMatch(/^data:image\/png;base64,/);
    expect(legend.text).toContain('✶ Maintain Pay this cost and the card remains on table until the next maintenance is due.');
    expect(legend.text).toContain('☠ Sacrifice Place the card out of play. Any cards on that card are lost.');
    expect(buildSearchPreviews([section], 'next maintenance')[0].pageRef).toBe(99);
    const shorthand = document.sections.find(s => s.id === 'icons-shorthand-icons')!;
    expect(shorthand.blocks.some(b => b.type === 'image' && b.text?.includes('Immune to Alter'))).toBe(true);
  });

  it('does not lose possessive mentions when search uses smaller source subsections', () => {
    const index = buildRulesSearchIndex(document);
    const filtered = filterSectionsByQuery(document.sections, index, 'vader');
    expect(buildSearchPreviews(filtered, 'vader', 10000)).toEqual(buildSearchPreviews(document.sections, 'vader', 10000));
  });

  it('indexes a whole word across style boundaries and gives each token a unique position', () => {
    const block = {type: 'paragraph' as const, text: 'recirculate recirculate', textRuns: [
      {text: 're'}, {text: 'circulate ', bold: true}, {text: 'recirculate', italic: true},
    ]};
    const fixture = {...document, sections: [{id: 'test', anchor: 'test', title: 'Test', level: 1, pageRef: 1, blocks: [block]}]};
    expect(rulesBlockText(block)).toBe('recirculate recirculate');
    expect(buildRulesSearchIndex(fixture).tokenMap.recirculate.map(p => p.tokenPosition)).toEqual([0, 1]);
    expect(buildSearchPreviews(fixture.sections, 'recirculate')).toHaveLength(2);
  });
});
