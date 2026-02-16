import {
  applyCleanupEdits,
  collectCleanupTargets,
  scoreParagraphForLlmCleanup,
} from '../llmCleanup';
import {RulesDocument} from '../types';

describe('llm cleanup helpers', () => {
  it('scores noisy OCR text higher than normal paragraph text', () => {
    const noisy = "Sometimes two or m ore automatic actions are triggered by the same event";
    const clean = 'Sometimes two or more automatic actions are triggered by the same event';

    expect(scoreParagraphForLlmCleanup(noisy)).toBeGreaterThan(
      scoreParagraphForLlmCleanup(clean),
    );
  });

  it('collects only high-score paragraph blocks', () => {
    const document: RulesDocument = {
      version: '1',
      sourceUrl: 'https://example.org',
      sourceSha256: 'x',
      generatedAt: '2026-02-15T00:00:00.000Z',
      toc: [],
      sections: [
        {
          id: 'a',
          title: 'A',
          level: 1,
          anchor: 'a',
          pageRef: 1,
          blocks: [
            {type: 'paragraph', textRuns: [{text: 'Normal sentence text.'}]},
            {
              type: 'paragraph',
              textRuns: [
                {
                  text: 'Sometimes two or m ore automatic actions are triggered by the same event',
                },
              ],
            },
          ],
        },
      ],
    };

    const targets = collectCleanupTargets(document, {minScore: 3, limit: 10});
    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe('0:1');
  });

  it('applies accepted edits and skips risky outliers', () => {
    const document: RulesDocument = {
      version: '1',
      sourceUrl: 'https://example.org',
      sourceSha256: 'x',
      generatedAt: '2026-02-15T00:00:00.000Z',
      toc: [],
      sections: [
        {
          id: 'a',
          title: 'A',
          level: 1,
          anchor: 'a',
          pageRef: 1,
          blocks: [
            {type: 'paragraph', textRuns: [{text: 'bad copy goes here'}]},
            {type: 'paragraph', textRuns: [{text: 'leave as-is'}]},
          ],
        },
      ],
    };

    const {updated, appliedCount, skippedCount} = applyCleanupEdits(document, {
      '0:0': 'better copy goes here',
      '0:1': 'x',
    });

    expect(appliedCount).toBe(1);
    expect(skippedCount).toBe(1);
    expect(updated.sections[0].blocks[0].textRuns[0].text).toBe('better copy goes here');
    expect(updated.sections[0].blocks[1].textRuns[0].text).toBe('leave as-is');
  });
});
