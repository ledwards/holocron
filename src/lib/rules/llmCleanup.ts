import {RulesDocument} from './types';

export interface CleanupTarget {
  id: string;
  sectionIndex: number;
  blockIndex: number;
  sectionTitle: string;
  text: string;
  score: number;
  pageRef: number;
}

const SPLIT_WORD_PATTERN = /\b[A-Za-z]{2,}\s+[b-hj-z]\s+[a-z]{2,}\b/g;
const SINGLE_LETTER_GAP_PATTERN = /\b[a-z]\s+[a-z]{3,}\b/g;
const ODD_HYPHEN_PATTERN = /\s-\s/g;
const TOC_LEADER_PATTERN = /\.{4,}/g;

function countMatches(value: string, pattern: RegExp): number {
  const matches = value.match(pattern);
  return matches ? matches.length : 0;
}

export function scoreParagraphForLlmCleanup(text: string): number {
  const compact = text.trim();
  if (!compact) {
    return 0;
  }

  const splitWords = countMatches(compact, SPLIT_WORD_PATTERN);
  const singleLetterGaps = countMatches(compact, SINGLE_LETTER_GAP_PATTERN);
  const oddHyphens = countMatches(compact, ODD_HYPHEN_PATTERN);
  const tocLeaders = countMatches(compact, TOC_LEADER_PATTERN);
  const shortFragments = compact
    .split(/\s+/)
    .filter(token => /^[A-Za-z]{1,2}$/.test(token)).length;

  let score = 0;
  score += splitWords * 4;
  score += singleLetterGaps * 2;
  score += oddHyphens * 1.5;
  score += tocLeaders * 3;
  score += shortFragments >= 8 ? 2 : 0;
  score += compact.length > 260 ? 1 : 0;

  return Number(score.toFixed(2));
}

export function collectCleanupTargets(
  document: RulesDocument,
  options?: {minScore?: number; limit?: number},
): CleanupTarget[] {
  const minScore = options?.minScore ?? 3;
  const limit = options?.limit ?? 250;
  const targets: CleanupTarget[] = [];

  document.sections.forEach((section, sectionIndex) => {
    section.blocks.forEach((block, blockIndex) => {
      if (block.type !== 'paragraph') {
        return;
      }
      const text = block.textRuns.map(run => run.text).join('');
      const score = scoreParagraphForLlmCleanup(text);
      if (score < minScore) {
        return;
      }

      targets.push({
        id: `${sectionIndex}:${blockIndex}`,
        sectionIndex,
        blockIndex,
        sectionTitle: section.title,
        text,
        score,
        pageRef: block.pageRef || section.pageRef || 1,
      });
    });
  });

  return targets
    .sort((a, b) => b.score - a.score || a.sectionIndex - b.sectionIndex)
    .slice(0, limit);
}

export function applyCleanupEdits(
  document: RulesDocument,
  edits: Record<string, string>,
): {updated: RulesDocument; appliedCount: number; skippedCount: number} {
  let appliedCount = 0;
  let skippedCount = 0;

  const updated: RulesDocument = {
    ...document,
    sections: document.sections.map((section, sectionIndex) => ({
      ...section,
      blocks: section.blocks.map((block, blockIndex) => {
        if (block.type !== 'paragraph') {
          return block;
        }
        const id = `${sectionIndex}:${blockIndex}`;
        const cleaned = edits[id];
        if (!cleaned) {
          return block;
        }

        const original = block.textRuns.map(run => run.text).join('');
        const trimmed = cleaned.trim();
        if (!trimmed) {
          skippedCount += 1;
          return block;
        }

        const ratio = trimmed.length / Math.max(1, original.length);
        if (ratio < 0.4 || ratio > 1.8) {
          skippedCount += 1;
          return block;
        }

        appliedCount += 1;
        return {
          ...block,
          textRuns: [{text: trimmed}],
        };
      }),
    })),
  };

  return {updated, appliedCount, skippedCount};
}
