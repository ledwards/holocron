import {
  diffRulesQuality,
  evaluateRulesQuality,
  scanRulesQuality,
  RulesQualityReport,
} from '../qualityGate';
import {RulesDocument} from '../types';

function buildDoc(lines: string[]): RulesDocument {
  return {
    version: '1',
    sourceUrl: 'x',
    sourceSha256: 'y',
    generatedAt: 'z',
    toc: [],
    sections: [
      {
        id: 's1',
        title: 'Section',
        level: 1,
        anchor: 'section',
        pageRef: 9,
        blocks: lines.map(line => ({
          type: 'paragraph' as const,
          textRuns: [{text: line}],
        })),
      },
    ],
  };
}

describe('rules quality gate', () => {
  it('detects known artifacts in document text', () => {
    const doc = buildDoc([
      'Not Endorsed or Sponsored by Lucasfilm',
      "they'renot his",
      "it'snot legal",
      "player'sturn starts",
      're -circulate',
      'eshuffle) a deck or pile,',
    ]);

    const report = scanRulesQuality(doc);
    const byId = new Map(report.patterns.map(pattern => [pattern.id, pattern]));

    expect(byId.get('footer_disclaimer')?.count).toBe(1);
    expect(byId.get('stuck_contractions')?.count).toBeGreaterThanOrEqual(2);
    expect(byId.get('stuck_possessive_turn')?.count).toBe(1);
    expect(byId.get('re_hyphen_space')?.count).toBe(1);
    expect(byId.get('typo_eshuffle')?.count).toBe(1);
  });

  it('fails evaluation when counts exceed max thresholds', () => {
    const doc = buildDoc(["it'snot optional"]);
    const report = scanRulesQuality(doc);
    const evaluation = evaluateRulesQuality(report);

    expect(evaluation.ok).toBe(false);
    expect(evaluation.thresholdFailures.some(failure => failure.id === 'stuck_contractions')).toBe(
      true,
    );
  });

  it('reports diffs between previous and current quality reports', () => {
    const previous: RulesQualityReport = {
      generatedAt: 't1',
      totalMatches: 1,
      patterns: [
        {id: 'a', label: 'A', maxCount: 0, count: 1, examples: []},
        {id: 'b', label: 'B', maxCount: 0, count: 0, examples: []},
      ],
    };
    const current: RulesQualityReport = {
      generatedAt: 't2',
      totalMatches: 3,
      patterns: [
        {id: 'a', label: 'A', maxCount: 0, count: 2, examples: []},
        {id: 'b', label: 'B', maxCount: 0, count: 1, examples: []},
      ],
    };

    const diff = diffRulesQuality(previous, current);
    expect(diff).toEqual([
      {id: 'a', previous: 1, current: 2, delta: 1},
      {id: 'b', previous: 0, current: 1, delta: 1},
    ]);
  });
});
