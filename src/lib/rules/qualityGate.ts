import {RulesDocument} from './types';

export interface QualityPattern {
  id: string;
  label: string;
  regex: RegExp;
  maxCount: number;
}

export interface QualityMatchExample {
  sectionId: string;
  sectionTitle: string;
  pageRef: number;
  text: string;
}

export interface QualityPatternResult {
  id: string;
  label: string;
  maxCount: number;
  count: number;
  examples: QualityMatchExample[];
}

export interface RulesQualityReport {
  generatedAt: string;
  totalMatches: number;
  patterns: QualityPatternResult[];
}

export interface QualityEvaluationResult {
  ok: boolean;
  thresholdFailures: Array<{id: string; count: number; maxCount: number}>;
}

export interface QualityDiffEntry {
  id: string;
  previous: number;
  current: number;
  delta: number;
}

const MAX_EXAMPLES_PER_PATTERN = 5;

export const DEFAULT_QUALITY_PATTERNS: QualityPattern[] = [
  {
    id: 'footer_disclaimer',
    label: 'Footer leak: Not Endorsed/Sponsored',
    regex: /not endorsed or sponsored by lucasfilm/i,
    maxCount: 0,
  },
  {
    id: 'page_marker',
    label: 'Page marker leak: Page N',
    regex: /\bpage\s+\d+\b/i,
    maxCount: 0,
  },
  {
    id: 'stuck_contractions',
    label: "Stuck contractions (e.g. they'renot)",
    regex: /\b(?:they['’]?renot|it['’]?snot)\b/i,
    maxCount: 0,
  },
  {
    id: 'stuck_possessive_turn',
    label: "Stuck possessive (player'sturn/hand)",
    regex: /\bplayer['’]?s(?:turn|hand)\b/i,
    maxCount: 0,
  },
  {
    id: 're_hyphen_space',
    label: 'Broken re- prefix with spaces',
    regex: /\bre\s+-\s*[a-z]+/i,
    maxCount: 0,
  },
  {
    id: 'typo_eshuffle',
    label: 'Known typo: eshuffle)',
    regex: /\beshuffle\)/i,
    maxCount: 0,
  },
  {
    id: 'obvious_join_typos',
    label: 'Common joined typos (dothe/can\'tplay/etc.)',
    regex:
      /\b(?:dothe|donot|can'tplay|he'llhave|it'sthe|it'snow|it'snot|they'renot|player'sturn)\b/i,
    maxCount: 150,
  },
];

function extractDocumentLines(
  document: RulesDocument,
): Array<{sectionId: string; sectionTitle: string; pageRef: number; text: string}> {
  const lines: Array<{sectionId: string; sectionTitle: string; pageRef: number; text: string}> = [];
  for (const section of document.sections) {
    for (const block of section.blocks) {
      for (const run of block.textRuns || []) {
        const text = String(run.text || '').replace(/\s+/g, ' ').trim();
        if (!text) {
          continue;
        }
        lines.push({
          sectionId: section.id,
          sectionTitle: section.title,
          pageRef: section.pageRef,
          text,
        });
      }
    }
  }
  return lines;
}

export function scanRulesQuality(
  document: RulesDocument,
  patterns: QualityPattern[] = DEFAULT_QUALITY_PATTERNS,
): RulesQualityReport {
  const lines = extractDocumentLines(document);
  const results: QualityPatternResult[] = patterns.map(pattern => ({
    id: pattern.id,
    label: pattern.label,
    maxCount: pattern.maxCount,
    count: 0,
    examples: [],
  }));

  for (const line of lines) {
    results.forEach((result, index) => {
      const pattern = patterns[index];
      if (!pattern.regex.test(line.text)) {
        return;
      }
      result.count += 1;
      if (result.examples.length < MAX_EXAMPLES_PER_PATTERN) {
        result.examples.push({
          sectionId: line.sectionId,
          sectionTitle: line.sectionTitle,
          pageRef: line.pageRef,
          text: line.text,
        });
      }
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalMatches: results.reduce((sum, result) => sum + result.count, 0),
    patterns: results,
  };
}

export function evaluateRulesQuality(report: RulesQualityReport): QualityEvaluationResult {
  const thresholdFailures = report.patterns
    .filter(pattern => pattern.count > pattern.maxCount)
    .map(pattern => ({
      id: pattern.id,
      count: pattern.count,
      maxCount: pattern.maxCount,
    }));

  return {
    ok: thresholdFailures.length === 0,
    thresholdFailures,
  };
}

export function diffRulesQuality(
  previous: RulesQualityReport,
  current: RulesQualityReport,
): QualityDiffEntry[] {
  const previousMap = new Map(previous.patterns.map(pattern => [pattern.id, pattern.count]));
  return current.patterns.map(pattern => {
    const prev = previousMap.get(pattern.id) || 0;
    const delta = pattern.count - prev;
    return {
      id: pattern.id,
      previous: prev,
      current: pattern.count,
      delta,
    };
  });
}
