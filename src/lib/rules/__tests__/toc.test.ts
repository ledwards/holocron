import {mapPdfTocToAnchors, resolveAnchorForPage} from '../toc';
import {PdfTocEntry, RulesSection} from '../types';

describe('mapPdfTocToAnchors', () => {
  it('maps TOC entries by normalized title first', () => {
    const sections: RulesSection[] = [
      {
        id: '1-general-rules',
        title: '1. General Rules',
        level: 1,
        anchor: '1-general-rules',
        pageRef: 2,
        blocks: [],
      },
      {
        id: '1-1-scope',
        title: '1.1 Scope',
        level: 2,
        anchor: '1-1-scope',
        pageRef: 3,
        blocks: [],
      },
    ];
    const toc: PdfTocEntry[] = [
      {title: '1 General Rules', level: 1, page: 2},
      {title: '1.1 Scope', level: 2, page: 3},
    ];

    const mapped = mapPdfTocToAnchors(toc, sections);

    expect(mapped.map(entry => entry.anchor)).toEqual([
      '1-general-rules',
      '1-1-scope',
    ]);
  });

  it('falls back to page-based anchors when title does not match', () => {
    const sections: RulesSection[] = [
      {
        id: 'intro',
        title: 'Introduction',
        level: 1,
        anchor: 'intro',
        pageRef: 1,
        blocks: [],
      },
      {
        id: 'turn-structure',
        title: 'Turn Structure',
        level: 1,
        anchor: 'turn-structure',
        pageRef: 8,
        blocks: [],
      },
    ];
    const toc: PdfTocEntry[] = [{title: 'Gameplay Overview', level: 1, page: 7}];

    const mapped = mapPdfTocToAnchors(toc, sections);
    expect(mapped[0].anchor).toBe('turn-structure');
  });

  it('falls back to section-derived toc if PDF toc is empty', () => {
    const sections: RulesSection[] = [
      {
        id: 's1',
        title: 'Section A',
        level: 1,
        anchor: 'section-a',
        pageRef: 1,
        blocks: [],
      },
    ];

    const mapped = mapPdfTocToAnchors([], sections);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].anchor).toBe('section-a');
  });
});

describe('resolveAnchorForPage', () => {
  const sections: RulesSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      level: 1,
      anchor: 'intro',
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
  ];

  it('returns exact page match', () => {
    expect(resolveAnchorForPage(5, sections)).toBe('timing');
  });

  it('returns next section anchor when no exact page exists', () => {
    expect(resolveAnchorForPage(4, sections)).toBe('timing');
  });

  it('returns last anchor when page is after final section', () => {
    expect(resolveAnchorForPage(99, sections)).toBe('timing');
  });
});
