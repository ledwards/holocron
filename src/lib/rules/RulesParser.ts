import {buildUniqueAnchor, slugifyAnchor} from './anchor';
import {
  ExtractedTextRun,
  RulesBlock,
  RulesDocument,
  RulesParseMetadata,
  RulesTextRun,
  RulesSection,
  TocEntry,
} from './types';

const HEADING_L1_SIZE = 16;
const HEADING_L2_SIZE = 13;
const LINE_Y_TOLERANCE = 2.5;
const PARAGRAPH_Y_GAP = 20;
const COLUMN_SPLIT_MIN_GAP = 120;

interface PreparedLine {
  page: number;
  y: number;
  level: number;
  startX: number;
  textRuns: RulesTextRun[];
  text: string;
  hasHref: boolean;
}

function runsShareStyle(a: RulesTextRun, b: RulesTextRun): boolean {
  return (
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic)
  );
}

export interface RulesPageAudit {
  page: number;
  score: number;
  lineCount: number;
  twoColumnDetected: boolean;
  columnTransitions: number;
  shortLineRatio: number;
  splitWordCount: number;
  punctuationOnlyLineCount: number;
}

const SPLIT_WORD_EXCLUSIONS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'be',
  'by',
  'do',
  'for',
  'from',
  'he',
  'her',
  'his',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'my',
  'no',
  'of',
  'on',
  'or',
  'our',
  'so',
  'the',
  'their',
  'them',
  'they',
  'to',
  'up',
  'we',
  'you',
  'your',
]);

function isTwoColumnPage(pageItems: ExtractedTextRun[]): boolean {
  if (pageItems.length < 6) {
    return false;
  }

  const rowBuckets: Array<{y: number; xs: number[]}> = [];
  for (const item of [...pageItems].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const last = rowBuckets[rowBuckets.length - 1];
    if (!last || Math.abs(last.y - item.y) > LINE_Y_TOLERANCE) {
      rowBuckets.push({y: item.y, xs: [item.x]});
    } else {
      last.xs.push(item.x);
    }
  }

  let rowsWithColumnGap = 0;
  for (const row of rowBuckets) {
    const xs = [...row.xs].sort((a, b) => a - b);
    let previousX = xs[0];
    for (let i = 1; i < xs.length; i += 1) {
      const gap = xs[i] - previousX;
      if (gap > COLUMN_SPLIT_MIN_GAP) {
        rowsWithColumnGap += 1;
        break;
      }
      previousX = xs[i];
    }
  }
  if (rowsWithColumnGap >= Math.max(2, Math.floor(rowBuckets.length * 0.15))) {
    return true;
  }

  const sortedByY = [...pageItems].sort((a, b) => a.y - b.y || a.x - b.x);
  const lineStartXs: number[] = [];
  let currentY = Number.NaN;
  let currentMinX = Infinity;

  const pushLine = () => {
    if (currentMinX < Infinity) {
      lineStartXs.push(currentMinX);
    }
  };

  for (const item of sortedByY) {
    if (!Number.isFinite(currentY) || Math.abs(item.y - currentY) > LINE_Y_TOLERANCE) {
      pushLine();
      currentY = item.y;
      currentMinX = item.x;
      continue;
    }
    if (item.x < currentMinX) {
      currentMinX = item.x;
    }
  }
  pushLine();

  if (lineStartXs.length < 4) {
    return false;
  }

  const sortedStarts = [...lineStartXs].sort((a, b) => a - b);
  let bestGap = -Infinity;
  let splitX = 0;
  for (let i = 1; i < sortedStarts.length; i += 1) {
    const left = sortedStarts[i - 1];
    const right = sortedStarts[i];
    const gap = right - left;
    if (gap > bestGap) {
      bestGap = gap;
      splitX = left + gap / 2;
    }
  }

  if (bestGap < COLUMN_SPLIT_MIN_GAP) {
    return false;
  }

  const leftLineCount = lineStartXs.filter(x => x < splitX).length;
  const rightLineCount = lineStartXs.length - leftLineCount;
  return leftLineCount >= 2 && rightLineCount >= 2;
}

function findTwoColumnLayout(
  pageItems: ExtractedTextRun[],
): {splitX: number; rightStartX: number} | null {
  if (pageItems.length < 6) {
    return null;
  }

  const rowBuckets: Array<{y: number; xs: number[]}> = [];
  for (const item of [...pageItems].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const last = rowBuckets[rowBuckets.length - 1];
    if (!last || Math.abs(last.y - item.y) > LINE_Y_TOLERANCE) {
      rowBuckets.push({y: item.y, xs: [item.x]});
    } else {
      last.xs.push(item.x);
    }
  }
  const rowGapSplits: number[] = [];
  for (const row of rowBuckets) {
    const xs = [...row.xs].sort((a, b) => a - b);
    let bestGap = -Infinity;
    let splitX = 0;
    for (let i = 1; i < xs.length; i += 1) {
      const gap = xs[i] - xs[i - 1];
      if (gap > bestGap) {
        bestGap = gap;
        splitX = xs[i - 1] + gap / 2;
      }
    }
    if (bestGap > COLUMN_SPLIT_MIN_GAP) {
      rowGapSplits.push(splitX);
    }
  }

  const sortedByY = [...pageItems].sort((a, b) => a.y - b.y || a.x - b.x);
  const lineStartXs: number[] = [];
  let currentY = Number.NaN;
  let currentMinX = Infinity;
  const pushLine = () => {
    if (currentMinX < Infinity) {
      lineStartXs.push(currentMinX);
    }
  };
  for (const item of sortedByY) {
    if (!Number.isFinite(currentY) || Math.abs(item.y - currentY) > LINE_Y_TOLERANCE) {
      pushLine();
      currentY = item.y;
      currentMinX = item.x;
      continue;
    }
    if (item.x < currentMinX) {
      currentMinX = item.x;
    }
  }
  pushLine();

  if (lineStartXs.length < 4 && rowGapSplits.length < 2) {
    return null;
  }

  let splitX = 0;
  let rightStartX = 0;
  let bestGap = -Infinity;
  if (lineStartXs.length >= 4) {
    const sortedStarts = [...lineStartXs].sort((a, b) => a - b);
    for (let i = 1; i < sortedStarts.length; i += 1) {
      const left = sortedStarts[i - 1];
      const right = sortedStarts[i];
      const gap = right - left;
      if (gap > bestGap) {
        bestGap = gap;
        splitX = left + gap / 2;
        rightStartX = right;
      }
    }
  }

  if (bestGap < COLUMN_SPLIT_MIN_GAP) {
    if (rowGapSplits.length >= 2) {
      const sortedSplitXs = [...rowGapSplits].sort((a, b) => a - b);
      splitX = sortedSplitXs[Math.floor(sortedSplitXs.length / 2)];
      const rightStarts = lineStartXs.filter(x => x >= splitX).sort((a, b) => a - b);
      if (rightStarts.length > 0) {
        rightStartX = rightStarts[0];
      }
    } else {
      return null;
    }
  }

  if (rightStartX <= 0) {
    const rightStarts = lineStartXs.filter(x => x >= splitX).sort((a, b) => a - b);
    if (rightStarts.length > 0) {
      rightStartX = rightStarts[0];
    } else {
      const rightItems = pageItems
        .map(item => item.x)
        .filter(x => x >= splitX)
        .sort((a, b) => a - b);
      if (rightItems.length > 0) {
        rightStartX = rightItems[0];
      } else {
        return null;
      }
    }
  }

  let rowsWithColumnGap = 0;
  for (const row of rowBuckets) {
    const xs = [...row.xs].sort((a, b) => a - b);
    let previousX = xs[0];
    for (let i = 1; i < xs.length; i += 1) {
      const gap = xs[i] - previousX;
      if (gap > COLUMN_SPLIT_MIN_GAP) {
        rowsWithColumnGap += 1;
        break;
      }
      previousX = xs[i];
    }
  }

  if (rowsWithColumnGap < Math.max(2, Math.floor(rowBuckets.length * 0.15))) {
    return null;
  }

  const splitSource = lineStartXs.length >= 4 ? lineStartXs : rowGapSplits;
  const leftLineCount = splitSource.filter(x => x < splitX).length;
  const rightLineCount = splitSource.length - leftLineCount;
  if (leftLineCount < 2 || rightLineCount < 2) {
    if (rowGapSplits.length < 2) {
      return null;
    }
  }

  return {splitX, rightStartX};
}

function sortItemsForReadingOrder(items: ExtractedTextRun[]): ExtractedTextRun[] {
  const byPage: Record<number, ExtractedTextRun[]> = {};

  for (const item of items) {
    if (!byPage[item.page]) {
      byPage[item.page] = [];
    }
    byPage[item.page].push(item);
  }

  const pages = Object.keys(byPage)
    .map(value => Number(value))
    .sort((a, b) => a - b);
  const sorted: ExtractedTextRun[] = [];

  for (const page of pages) {
    const pageItems = byPage[page];
    const pageItemsSorted = [...pageItems].sort((a, b) => b.y - a.y || a.x - b.x);
    const pageRows: Array<{y: number; items: ExtractedTextRun[]}> = [];
    for (const item of pageItemsSorted) {
      const last = pageRows[pageRows.length - 1];
      if (!last || Math.abs(last.y - item.y) > LINE_Y_TOLERANCE) {
        pageRows.push({y: item.y, items: [item]});
      } else {
        last.items.push(item);
      }
    }

    const pageLines: Array<{y: number; startX: number; items: ExtractedTextRun[]}> = [];
    for (const row of pageRows) {
      const sortedRowItems = [...row.items].sort((a, b) => a.x - b.x);
      let group: ExtractedTextRun[] = [];
      let lastX = Number.NaN;
      for (const rowItem of sortedRowItems) {
        if (group.length === 0) {
          group.push(rowItem);
          lastX = rowItem.x;
          continue;
        }
        const gap = rowItem.x - lastX;
        if (gap > COLUMN_SPLIT_MIN_GAP) {
          pageLines.push({y: row.y, startX: group[0].x, items: group});
          group = [rowItem];
        } else {
          group.push(rowItem);
        }
        lastX = rowItem.x;
      }
      if (group.length > 0) {
        pageLines.push({y: row.y, startX: group[0].x, items: group});
      }
    }

    if (isTwoColumnPage(pageItems)) {
      const layout = findTwoColumnLayout(pageItems);
      if (layout === null) {
        pageLines
          .sort((a, b) => b.y - a.y || a.startX - b.startX)
          .forEach(line => {
            sorted.push(...line.items.sort((a, b) => a.x - b.x));
          });
        continue;
      }
      const {rightStartX} = layout;

      const left: Array<{y: number; startX: number; items: ExtractedTextRun[]}> = [];
      const right: Array<{y: number; startX: number; items: ExtractedTextRun[]}> = [];

      for (const row of pageRows) {
        const rowItems = [...row.items].sort((a, b) => a.x - b.x);
        const rowGroups: Array<{startX: number; items: ExtractedTextRun[]}> = [];
        let group: ExtractedTextRun[] = [];
        let lastX = Number.NaN;
        for (const rowItem of rowItems) {
          if (group.length === 0) {
            group.push(rowItem);
            lastX = rowItem.x;
            continue;
          }
          if (rowItem.x - lastX > COLUMN_SPLIT_MIN_GAP) {
            rowGroups.push({startX: group[0].x, items: group});
            group = [rowItem];
          } else {
            group.push(rowItem);
          }
          lastX = rowItem.x;
        }
        if (group.length > 0) {
          rowGroups.push({startX: group[0].x, items: group});
        }

        for (const rowGroup of rowGroups) {
          const bucket = rowGroup.startX >= rightStartX - 20 ? right : left;
          bucket.push({y: row.y, startX: rowGroup.startX, items: rowGroup.items});
        }
      }

      left.sort((a, b) => b.y - a.y || a.startX - b.startX);
      right.sort((a, b) => b.y - a.y || a.startX - b.startX);

      [...left, ...right].forEach(line => {
        sorted.push(...line.items.sort((a, b) => a.x - b.x));
      });
      continue;
    }

    pageLines
      .sort((a, b) => b.y - a.y || a.startX - b.startX)
      .forEach(line => {
        sorted.push(...line.items.sort((a, b) => a.x - b.x));
      });
  }

  return sorted;
}

function inferHeadingLevel(item: ExtractedTextRun): number {
  const size = item.fontSize || 0;
  if (size >= HEADING_L1_SIZE) {
    return 1;
  }
  if (size >= HEADING_L2_SIZE) {
    return 2;
  }
  if (
    Boolean(item.isBold) &&
    size >= 11 &&
    /^(?:\d+(?:\.\d+)*|chapter|appendix|glossary)\b/i.test(
      String(item.text || '').trim(),
    )
  ) {
    return size >= 14 ? 1 : 2;
  }
  return 0;
}

function normalizeHref(href?: string): string | undefined {
  if (!href) {
    return undefined;
  }
  return `#${slugifyAnchor(href)}`;
}

function requiresSpaceBetween(left: string, right: string): boolean {
  if (!left || !right) {
    return false;
  }

  const leftWord = (left.match(/([A-Za-z]+)$/) || [])[1];
  const rightWord = (right.match(/^([A-Za-z]+)/) || [])[1];
  if (leftWord && rightWord) {
    const leftLower = leftWord.toLowerCase();
    const rightLower = rightWord.toLowerCase();
    const leftShortLikelySplit =
      leftWord.length <= 2 &&
      /^[A-Za-z]+$/.test(leftWord) &&
      /^[a-z]+$/.test(rightWord) &&
      !SPLIT_WORD_EXCLUSIONS.has(leftLower);
    const suffixLikelySplit =
      /^[A-Za-z]{3,}$/.test(leftWord) &&
      /^(?:s|es|ed|er|ers|ing|ly)$/i.test(rightWord) &&
      !SPLIT_WORD_EXCLUSIONS.has(leftLower);
    const rightShortLikelySplit =
      rightWord.length <= 2 &&
      /^[a-z]+$/.test(rightWord) &&
      /^[A-Za-z]{3,}$/.test(leftWord) &&
      !SPLIT_WORD_EXCLUSIONS.has(leftLower) &&
      !SPLIT_WORD_EXCLUSIONS.has(rightLower);
    if (leftShortLikelySplit || suffixLikelySplit || rightShortLikelySplit) {
      return false;
    }
  }

  const leftEnd = left[left.length - 1];
  const rightStart = right[0];

  if (/\s/.test(leftEnd) || /\s/.test(rightStart)) {
    return false;
  }
  if (rightStart === '-') {
    return false;
  }
  if (/[([{\/-]/.test(leftEnd)) {
    return false;
  }
  if (/[)\].,;:!?]/.test(rightStart)) {
    return false;
  }
  return true;
}

function appendText(left: string, right: string): string {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  if (right === '-') {
    return `${left} -`;
  }
  const merged = `${left}${requiresSpaceBetween(left, right) ? ' ' : ''}${right}`;
  return merged.replace(
    /\b([A-Za-z][A-Za-z'’]*)\s*-\s*([a-z][A-Za-z'’]*)\b/g,
    '$1-$2',
  );
}

function normalizeCommonSpacing(text: string): string {
  return text
    .replace(/\bActi\s+ons\b/gi, match =>
      /^[A-Z]/.test(match) ? 'Actions' : 'actions',
    )
    .replace(/\bExa\s+mple(?:s)?\b/gi, match =>
      /s$/i.test(match) ? 'Examples' : 'Example',
    )
    .replace(/\ba\s+ction\b/g, 'action')
    .replace(/\bcharac\s+ters\b/g, 'characters')
    .replace(/\bA\s+tanother\b/g, 'At another')
    .replace(/\bOn\s+cethe\b/g, 'Once the')
    .replace(/\bfur\s+ther\b/g, 'further')
    .replace(/\btell\s+mewhen\b/gi, 'tell me when')
    .replace(/\bpreem\s+ptone\b/gi, 'preempt one')
    .replace(/\bi\s+twas\b/gi, 'it was')
    .replace(/\btak\s+esplace\b/gi, 'takes place')
    .replace(/\bmanne\s+rare\b/gi, 'manner are')
    .replace(/\bthei\s+rown\b/gi, 'their own')
    .replace(/\bfor\s+cedrain\b/gi, 'force drain')
    .replace(/\bmaynever\b/gi, 'may never')
    .replace(/\bleavest\s+able\b/gi, 'leaves table')
    .replace(/\bparticipant\s+sleave\b/gi, 'participants leave')
    .replace(/\ba\s+utomated\b/gi, 'automated')
    .replace(/\bnotinitiate\b/gi, 'not initiate')
    .replace(/\btothe\b/gi, 'to the')
    .replace(/\bfromgame\b/gi, 'from game')
    .replace(/\bto\s+ldotherwise\b/gi, 'told otherwise')
    .replace(/\btoldotherwise\b/gi, 'told otherwise')
    .replace(/\ban\s+dother\b/gi, 'and other')
    .replace(/\bdonot\b/gi, 'do not')
    .replace(/\bdoso\b/gi, 'do so')
    .replace(/\bdothis\b/gi, 'do this')
    .replace(/\bdothe\b/gi, 'do the')
    .replace(/\bpla\s+yers\b/gi, 'players')
    .replace(/\bbefor\s+echoosing\b/gi, 'before choosing')
    .replace(/\bmus\s+treveal\b/gi, 'must reveal')
    .replace(/\btreveal\b/gi, 'to reveal')
    .replace(/\bthey['’]?renot\b/gi, "they're not")
    .replace(/\bit['’]?snot\b/gi, "it's not")
    .replace(/\bplayer\s*['’`´]?\s*s\s*turn\b/gi, "player's turn")
    .replace(/\bplayer\s*['’`´]?\s*s\s*hand\b/gi, "player's hand")
    .replace(/\bplayer['’]?s(turn|hand|deck|pile|stack)\b/gi, "player's $1")
    .replace(/\bopponent['’]?s(turn|hand|deck|pile|stack)\b/gi, "opponent's $1")
    .replace(/\bit['’]?s(the|now)\b/gi, "it's $1")
    .replace(/\bdoesn['’]?t(need|want)\b/gi, "doesn't $1")
    .replace(/\bcan['’]?t(play)\b/gi, "can't $1")
    .replace(/\bhe['’]?ll(have)\b/gi, "he'll $1")
    .replace(/\ba\s+nd([a-z]{2,})\b/gi, 'and $1')
    .replace(/do esn't/gi, "doesn't")
    .replace(/\bdo\s+es['’]?n['’]?t\b/gi, "doesn't")
    .replace(/\bd\s*o\s+e\s*s\s*['’]?\s*n\s*['’]?\s*t\b/gi, "doesn't")
    .replace(/\bnev\s+erhappens\b/gi, 'never happens')
    .replace(/\b([A-Za-z]+(?:['’]re|['’]ve|['’]ll|['’]d|['’]m|n['’]t))([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z]+['’]s)([A-Za-z]{2,})\b/g, '$1 $2');
}

function normalizeFragmentedTokenText(text: string): string {
  if (!text) {
    return text;
  }

  const stripped = text
    .replace(/\bnot endorsed or sponsored by lucasfilm\b/gi, '')
    .replace(/\bpage\s+\d+\b/gi, '');

  const joinPrefix = (_: string, left: string, right: string) => {
    if (SPLIT_WORD_EXCLUSIONS.has(left.toLowerCase())) {
      return `${left} ${right}`;
    }
    return `${left}${right}`;
  };

  return stripped
    .replace(/\bActi\s+ons\b/gi, match =>
      /^[A-Z]/.test(match) ? 'Actions' : 'actions',
    )
    .replace(/\bExa\s+mple(?:s)?\b/gi, match =>
      /s$/i.test(match) ? 'Examples' : 'Example',
    )
    .replace(/\ba\s+ction\b/g, 'action')
    .replace(/\bcharac\s+ters\b/g, 'characters')
    .replace(/\bA\s+tanother\b/g, 'At another')
    .replace(/\bOn\s+cethe\b/g, 'Once the')
    .replace(/\bfur\s+ther\b/g, 'further')
    .replace(/\btell\s+mewhen\b/gi, 'tell me when')
    .replace(/\bpreem\s+ptone\b/gi, 'preempt one')
    .replace(/\bi\s+twas\b/gi, 'it was')
    .replace(/\btak\s+esplace\b/gi, 'takes place')
    .replace(/\bmanne\s+rare\b/gi, 'manner are')
    .replace(/\bthei\s+rown\b/gi, 'their own')
    .replace(/\bfor\s+cedrain\b/gi, 'force drain')
    .replace(/\bmaynever\b/gi, 'may never')
    .replace(/\bleavest\s+able\b/gi, 'leaves table')
    .replace(/\bparticipant\s+sleave\b/gi, 'participants leave')
    .replace(/\ba\s+utomated\b/gi, 'automated')
    .replace(/\bnotinitiate\b/gi, 'not initiate')
    .replace(/\btothe\b/gi, 'to the')
    .replace(/\bfromgame\b/gi, 'from game')
    .replace(/\bto\s+ldotherwise\b/gi, 'told otherwise')
    .replace(/\btoldotherwise\b/gi, 'told otherwise')
    .replace(/\ban\s+dother\b/gi, 'and other')
    .replace(/\bdonot\b/gi, 'do not')
    .replace(/\bdoso\b/gi, 'do so')
    .replace(/\bdothis\b/gi, 'do this')
    .replace(/\bdothe\b/gi, 'do the')
    .replace(/\bpla\s+yers\b/gi, 'players')
    .replace(/\bbefor\s+echoosing\b/gi, 'before choosing')
    .replace(/\bmus\s+treveal\b/gi, 'must reveal')
    .replace(/\btreveal\b/gi, 'to reveal')
    .replace(/\b([A-Za-z][A-Za-z'’]*)\s*-\s*([a-z][A-Za-z'’]*)\b/g, '$1-$2')
    .replace(/\b([A-Za-z]+(?:['’]re|['’]ve|['’]ll|['’]d|['’]m|n['’]t))([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z]+['’]s)([A-Za-z]{2,})\b/g, '$1 $2')
    .replace(/\b([A-Za-z]{3,})\s+(s|es|ed|er|ers|ing|ly)\b/g, '$1$2')
    .replace(/\b([A-Za-z]{1,2})\s+([a-z]{3,})\b/g, joinPrefix)
    .replace(/\bplayer\s*['’`´]?\s*s\s*turn\b/gi, "player's turn")
    .replace(/\bplayer\s*['’`´]?\s*s\s*hand\b/gi, "player's hand")
    .replace(/\bplayer['’]?s(turn|hand|deck|pile|stack)\b/gi, "player's $1")
    .replace(/\bopponent['’]?s(turn|hand|deck|pile|stack)\b/gi, "opponent's $1")
    .replace(/\bit['’]?s(the|now)\b/gi, "it's $1")
    .replace(/\bdoesn['’]?t(need|want)\b/gi, "doesn't $1")
    .replace(/\bcan['’]?t(play)\b/gi, "can't $1")
    .replace(/\bhe['’]?ll(have)\b/gi, "he'll $1")
    .replace(/\ba\s+nd([a-z]{2,})\b/gi, 'and $1')
    .replace(/\bdo\s+es['’]?n['’]?t\b/gi, "doesn't")
    .replace(/\bd\s*o\s+e\s*s\s*['’]?\s*n\s*['’]?\s*t\b/gi, "doesn't")
    .replace(/\bnev\s+erhappens\b/gi, 'never happens')
    .replace(/\b([A-Za-z])\s+([a-z]{4,})\b/g, (_match, left, right) => {
      const leftLower = String(left).toLowerCase();
      if (SPLIT_WORD_EXCLUSIONS.has(leftLower)) {
        return `${left} ${right}`;
      }
      return `${left}${right}`;
    })
    .replace(/\beshuffle\)/gi, 'reshuffle)')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function lineTextFromRuns(textRuns: RulesTextRun[]): string {
  return textRuns.reduce((acc, run) => appendText(acc, run.text), '');
}

function shouldDropLine(line: PreparedLine): boolean {
  const compact = line.text.replace(/\s+/g, '');
  const normalized = line.text.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return true;
  }
  if (/not\s+en(?:dorsed)?/i.test(normalized) || /sponsored by lucasfilm/i.test(normalized)) {
    return true;
  }
  if (/^not endorsed or sponsored by lucasfilm(?:\s+page\s+\d+)?$/i.test(normalized)) {
    return true;
  }
  if (/^page\s+\d+$/i.test(normalized)) {
    return true;
  }
  if (line.level === 0 && /^chapter\s+\d+\s*-[\s\S]+$/i.test(normalized)) {
    return true;
  }
  if (/^\.+$/.test(compact)) {
    return true;
  }
  if (line.hasHref && /^\.+\d+$/.test(compact)) {
    return true;
  }
  if (line.hasHref && /^\d+$/.test(compact)) {
    return true;
  }
  if (
    line.hasHref &&
    /\.\.{3,}/.test(normalized) &&
    /\d(?:[\s\d]{0,3})$/.test(normalized)
  ) {
    return true;
  }
  return false;
}

function buildLines(sortedItems: ExtractedTextRun[]): PreparedLine[] {
  const lines: PreparedLine[] = [];
  let currentPage = -1;
  let currentY = 0;
  let currentLevel = 0;
  let currentStartX = 0;
  let currentRuns: RulesTextRun[] = [];
  let currentHasHref = false;

  const flush = () => {
    if (!currentRuns.length) {
      return;
    }
    const normalizedRuns = currentRuns
      .map(run => ({
        text: normalizeCommonSpacing(run.text),
        href: run.href,
        bold: run.bold,
        italic: run.italic,
      }))
      .filter(run => run.text.trim().length > 0);
    if (!normalizedRuns.length) {
      return;
    }

    const line: PreparedLine = {
      page: currentPage,
      y: currentY,
      level: currentLevel,
      startX: currentStartX,
      textRuns: normalizedRuns,
      text: lineTextFromRuns(normalizedRuns),
      hasHref: currentHasHref,
    };
    if (!shouldDropLine(line)) {
      lines.push(line);
    }
  };

  for (const item of sortedItems) {
    const token = normalizeFragmentedTokenText(item.text.trim());
    if (!token) {
      continue;
    }

    const itemLevel = inferHeadingLevel(item);
    const href = normalizeHref(item.internalHref);
    const startsNewLine =
      currentPage !== item.page || Math.abs(item.y - currentY) > LINE_Y_TOLERANCE;

    if (startsNewLine) {
      flush();
      currentPage = item.page;
      currentY = item.y;
      currentLevel = itemLevel;
      currentStartX = item.x;
      currentRuns = [
        {
          text: token,
          href,
          bold: Boolean(item.isBold),
          italic: Boolean(item.isItalic),
        },
      ];
      currentHasHref = Boolean(href);
      continue;
    }

    currentLevel = Math.max(currentLevel, itemLevel);
    currentHasHref = currentHasHref || Boolean(href);
    const lastRun = currentRuns[currentRuns.length - 1];
    const incomingRun: RulesTextRun = {
      text: token,
      href,
      bold: Boolean(item.isBold),
      italic: Boolean(item.isItalic),
    };
    if (lastRun && lastRun.href === href && runsShareStyle(lastRun, incomingRun)) {
      lastRun.text = appendText(lastRun.text, token);
    } else {
      if (shouldBreakAfterLeadBoldRun(currentRuns, incomingRun)) {
        incomingRun.text = `\n${incomingRun.text}`;
      } else if (lastRun && requiresSpaceBetween(lastRun.text, incomingRun.text)) {
        incomingRun.text = ` ${incomingRun.text}`;
      }
      currentRuns.push(incomingRun);
    }
  }

  flush();
  return lines;
}

function mergeParagraphTextRuns(
  previousRuns: RulesTextRun[],
  incomingRuns: RulesTextRun[],
): RulesTextRun[] {
  if (!previousRuns.length) {
    return incomingRuns;
  }
  if (!incomingRuns.length) {
    return previousRuns;
  }

  const merged = [...previousRuns];
  const nextRuns = incomingRuns.map(run => ({...run}));
  const last = merged[merged.length - 1];
  const first = nextRuns[0];
  const previousText = lineTextFromRuns(previousRuns).trim();
  const currentText = lineTextFromRuns(incomingRuns).trim();
  const firstIsHeadingLikeBold = Boolean(first.bold) && isHeadingLikeText(first.text);
  const breakBeforeHeadingLikeBold =
    firstIsHeadingLikeBold &&
    !startsListLike(currentText) &&
    !previousText.endsWith('\n') &&
    (isSentenceEnd(previousText) || previousText.length > 40);
  const shouldUseLineBreak =
    breakBeforeHeadingLikeBold ||
    startsListLike(currentText) ||
    ((last.bold || last.italic) && !first.bold && !first.italic && !isSentenceEnd(previousText));

  if (last.href === first.href && runsShareStyle(last, first)) {
    last.text = appendText(last.text, first.text);
    nextRuns.shift();
  } else if (shouldUseLineBreak) {
    first.text = `\n${first.text}`;
  } else if (requiresSpaceBetween(last.text, first.text)) {
    first.text = ` ${first.text}`;
  }

  merged.push(...nextRuns);
  return merged;
}

function shouldBreakAfterLeadBoldRun(existingRuns: RulesTextRun[], nextRun: RulesTextRun): boolean {
  if (existingRuns.length !== 1) {
    return false;
  }
  const lead = existingRuns[0];
  if (!lead.bold || nextRun.bold || nextRun.italic) {
    return false;
  }

  const leadText = lead.text.trim();
  const nextText = nextRun.text.trim();
  if (!leadText || !nextText) {
    return false;
  }
  if (isSentenceEnd(leadText)) {
    return false;
  }
  if (!/^[A-Z][A-Za-z0-9'’&,\-]*(?:\s+[A-Z][A-Za-z0-9'’&,\-]*){0,8}$/.test(leadText)) {
    return false;
  }
  return /^[A-Za-z"(]/.test(nextText);
}

function shouldContinueParagraph(previousLine: PreparedLine, currentLine: PreparedLine): boolean {
  if (previousLine.page !== currentLine.page) {
    return false;
  }

  if (Math.abs(previousLine.startX - currentLine.startX) > 80) {
    return false;
  }

  const yDelta = Math.abs(currentLine.y - previousLine.y);
  if (yDelta > PARAGRAPH_Y_GAP) {
    return false;
  }

  const previousText = previousLine.text.trim();
  const currentText = currentLine.text.trim();
  if (!previousText || !currentText) {
    return false;
  }

  if (startsListLike(currentText)) {
    return true;
  }

  const endsSentence = /[.!?:]$/.test(previousText);
  const startsUppercase = /^[A-Z"]/.test(currentText);
  if (endsSentence && startsUppercase) {
    return false;
  }

  return true;
}

function createParagraphBlock(line: PreparedLine): RulesBlock {
  const confidence = evaluateParagraphConfidence(line.textRuns);
  return {
    type: 'paragraph',
    pageRef: line.page,
    textRuns: line.textRuns,
    confidenceScore: confidence.score,
    confidenceFlags: confidence.flags,
  };
}

function createHeadingSection(
  line: PreparedLine,
  anchorCounts: Record<string, number>,
): RulesSection {
  const anchor = buildUniqueAnchor(line.text, anchorCounts);
  return {
    id: anchor,
    title: line.text,
    level: line.level,
    anchor,
    pageRef: line.page,
    blocks: [
      {
        type: 'heading',
        pageRef: line.page,
        textRuns: [{text: line.text}],
      },
    ],
  };
}

function createFallbackSection(anchorCounts: Record<string, number>): RulesSection {
  const fallbackTitle = 'Introduction';
  const anchor = buildUniqueAnchor(fallbackTitle, anchorCounts);
  return {
    id: anchor,
    title: fallbackTitle,
    level: 1,
    anchor,
    pageRef: 1,
    blocks: [],
  };
}

function buildToc(sections: RulesSection[]): TocEntry[] {
  return sections.map((section, index) => ({
    title: section.title,
    anchor: section.anchor,
    level: section.level,
    order: index,
  }));
}

function startsListLike(text: string): boolean {
  return /^\s*(?:[-*•]|\d+\.)\s*/.test(text);
}

function isHeadingLikeText(text: string): boolean {
  const value = String(text || '').trim();
  if (!value || value.length > 90) {
    return false;
  }
  if (!/^[A-Z]/.test(value)) {
    return false;
  }
  return /^[A-Z][A-Za-z0-9'’&,\-]*(?:\s+[A-Z][A-Za-z0-9'’&,\-]*){0,10}$/.test(value);
}

function isSentenceEnd(text: string): boolean {
  return /[.!?]["')\]]?$/.test(text.trim());
}

function endsWithContinuationCue(text: string): boolean {
  const value = text.trim();
  if (!value) {
    return false;
  }
  if (/[(:\-–—]$/.test(value)) {
    return true;
  }
  return /\b(?:a|an|and|as|at|because|but|by|for|from|if|in|into|is|of|on|or|that|the|to|unless|with)\s*$/i.test(
    value,
  );
}

function evaluateParagraphConfidence(textRuns: RulesTextRun[]): {
  score: number;
  flags: string[];
} {
  const text = lineTextFromRuns(textRuns).replace(/\s+/g, ' ').trim();
  if (!text) {
    return {score: 0, flags: ['empty']};
  }

  const flags: string[] = [];
  if (text.length < 20 && !isSentenceEnd(text) && !startsListLike(text)) {
    flags.push('orphan_short');
  }
  if (endsWithContinuationCue(text)) {
    flags.push('trailing_connector');
  }
  const openParens = (text.match(/\(/g) || []).length;
  const closeParens = (text.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    flags.push('unclosed_parenthesis');
  }
  if (/[A-Za-z]{1,2}\s+[A-Za-z]{8,}/.test(text) && !/[.!?]$/.test(text)) {
    flags.push('possible_split_word');
  }

  const score = Math.max(0, Number((1 - flags.length * 0.22).toFixed(2)));
  return {score, flags};
}

function shouldMergeParagraphBlocks(previous: RulesBlock, current: RulesBlock): boolean {
  if (previous.type !== 'paragraph' || current.type !== 'paragraph') {
    return false;
  }
  if (previous.pageRef !== current.pageRef) {
    return false;
  }

  const previousText = lineTextFromRuns(previous.textRuns).trim();
  const currentText = lineTextFromRuns(current.textRuns).trim();
  if (!previousText || !currentText) {
    return false;
  }

  if (startsListLike(currentText)) {
    return true;
  }
  if (startsListLike(previousText)) {
    return true;
  }

  if (isSentenceEnd(previousText)) {
    return false;
  }

  if (
    /^[A-Z][a-z]/.test(currentText) &&
    currentText.length > 10 &&
    !endsWithContinuationCue(previousText)
  ) {
    return false;
  }

  return true;
}

function mergeSectionParagraphBreaks(section: RulesSection): RulesSection {
  if (!section.blocks.length) {
    return section;
  }

  const mergedBlocks: RulesBlock[] = [];
  for (const block of section.blocks) {
    const previous = mergedBlocks[mergedBlocks.length - 1];
    if (previous && shouldMergeParagraphBlocks(previous, block)) {
      previous.textRuns = mergeParagraphTextRuns(previous.textRuns, block.textRuns);
      continue;
    }
    mergedBlocks.push({...block, textRuns: block.textRuns.map(run => ({...run}))});
  }

  mergedBlocks.forEach(block => {
    if (block.type !== 'paragraph') {
      return;
    }
    const confidence = evaluateParagraphConfidence(block.textRuns);
    block.confidenceScore = confidence.score;
    block.confidenceFlags = confidence.flags;
  });

  return {
    ...section,
    blocks: mergedBlocks,
  };
}

export function parseExtractedTextRuns(
  items: ExtractedTextRun[],
  metadata: RulesParseMetadata,
): RulesDocument {
  const sorted = sortItemsForReadingOrder(items);
  const lines = buildLines(sorted);
  const anchorCounts: Record<string, number> = {};
  const sections: RulesSection[] = [];

  let currentSection: RulesSection | null = null;
  let previousParagraphLine: PreparedLine | null = null;
  for (const line of lines) {
    const headingLevel = line.level;

    if (headingLevel > 0) {
      const headingText = line.text.trim();
      if (!/[A-Za-z0-9]/.test(headingText)) {
        previousParagraphLine = null;
        continue;
      }
      if (/^[A-Za-z]$/.test(headingText) && currentSection && currentSection.pageRef === line.page) {
        const headingBlock = currentSection.blocks[0];
        if (headingBlock && headingBlock.type === 'heading') {
          const currentHeading = headingBlock.textRuns.map(run => run.text).join('');
          const mergedHeading = appendText(currentHeading, headingText);
          headingBlock.textRuns = [{text: mergedHeading}];
          currentSection.title = mergedHeading;
          previousParagraphLine = null;
          continue;
        }
      }
      currentSection = createHeadingSection(line, anchorCounts);
      sections.push(currentSection);
      previousParagraphLine = null;
      continue;
    }

    if (!currentSection) {
      currentSection = createFallbackSection(anchorCounts);
      sections.push(currentSection);
    }

    const previousBlock = currentSection.blocks[currentSection.blocks.length - 1];
    const isContinuation =
      previousParagraphLine &&
      previousBlock &&
      previousBlock.type === 'paragraph' &&
      shouldContinueParagraph(previousParagraphLine, line);

    if (isContinuation) {
      previousBlock.textRuns = mergeParagraphTextRuns(
        previousBlock.textRuns,
        line.textRuns,
      );
    } else {
      currentSection.blocks.push(createParagraphBlock(line));
    }

    previousParagraphLine = line;
  }

  const normalizedSections = sections.map(section => mergeSectionParagraphBreaks(section));

  return {
    version: metadata.version,
    sourceUrl: metadata.sourceUrl,
    sourceSha256: metadata.sourceSha256,
    generatedAt: metadata.generatedAt,
    sections: normalizedSections,
    toc: buildToc(normalizedSections),
  };
}

export function auditExtractedTextRuns(items: ExtractedTextRun[]): RulesPageAudit[] {
  const sorted = sortItemsForReadingOrder(items);
  const lines = buildLines(sorted);
  const linesByPage: Record<number, PreparedLine[]> = {};
  lines.forEach(line => {
    if (!linesByPage[line.page]) {
      linesByPage[line.page] = [];
    }
    linesByPage[line.page].push(line);
  });

  const itemsByPage: Record<number, ExtractedTextRun[]> = {};
  items.forEach(item => {
    if (!itemsByPage[item.page]) {
      itemsByPage[item.page] = [];
    }
    itemsByPage[item.page].push(item);
  });

  const pages = Object.keys(itemsByPage)
    .map(value => Number(value))
    .sort((a, b) => a - b);

  return pages.map(page => {
    const pageItems = itemsByPage[page] || [];
    const pageLines = linesByPage[page] || [];
    const layout = findTwoColumnLayout(pageItems);
    const splitX = layout?.splitX ?? null;
    const twoColumnDetected = layout !== null;

    let transitions = 0;
    if (splitX !== null && pageLines.length > 1) {
      let previousSide = pageLines[0].startX < splitX ? 'L' : 'R';
      for (let i = 1; i < pageLines.length; i += 1) {
        const side = pageLines[i].startX < splitX ? 'L' : 'R';
        if (side !== previousSide) {
          transitions += 1;
        }
        previousSide = side;
      }
    }

    const shortLineCount = pageLines.filter(line => line.text.trim().length <= 3).length;
    const punctuationOnlyLineCount = pageLines.filter(line =>
      /^[^A-Za-z0-9]+$/.test(line.text.trim()),
    ).length;
    const splitWordCount = pageLines.reduce((acc, line) => {
      let count = 0;
      const words = line.text.split(/\s+/).map(word => word.replace(/[^A-Za-z'’]/g, ''));
      for (let i = 0; i < words.length - 1; i += 1) {
        const left = words[i];
        const right = words[i + 1];
        if (!left || !right) {
          continue;
        }
        if (!/^[A-Za-z]$/.test(left)) {
          continue;
        }
        if (!/^[a-z][a-z'’-]{2,}$/.test(right)) {
          continue;
        }
        if (SPLIT_WORD_EXCLUSIONS.has(left.toLowerCase())) {
          continue;
        }
        count += 1;
      }
      return acc + count;
    }, 0);

    const lineCount = pageLines.length || 1;
    const shortLineRatio = shortLineCount / lineCount;
    const transitionPenalty =
      splitX === null ? 0 : Math.max(0, transitions - 2) * 2;
    const shortPenalty = shortLineRatio * 10;
    const punctuationPenalty = punctuationOnlyLineCount * 0.75;
    const splitWordPenalty = splitWordCount * 2.5;
    const score = Number(
      (transitionPenalty + shortPenalty + punctuationPenalty + splitWordPenalty).toFixed(
        2,
      ),
    );

    return {
      page,
      score,
      lineCount: pageLines.length,
      twoColumnDetected,
      columnTransitions: transitions,
      shortLineRatio: Number(shortLineRatio.toFixed(3)),
      splitWordCount,
      punctuationOnlyLineCount,
    };
  });
}
