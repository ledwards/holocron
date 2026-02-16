import {ExtractedTextRun} from './types';

const LINE_Y_TOLERANCE = 2.5;
const SMALL_GAP = 70;
const FRAGMENT_JOIN_GAP = 12;
const PHRASE_FRAGMENT_GAP = 140;
const PREFER_NEXT_SINGLE_LETTERS = new Set(['a', 'e', 'i', 'o', 't', 'u']);
const PREFER_PREV_SINGLE_LETTERS = new Set(['d', 'g', 'l', 'm', 'n', 'r', 's', 'v']);
const CONTRACTION_S_BASES = new Set([
  'here',
  'how',
  'it',
  'let',
  'that',
  'there',
  'what',
  'when',
  'where',
  'who',
  'why',
]);
const PRONOUN_CONTRACTION_BASES = new Set([
  'i',
  'it',
  'she',
  'that',
  'there',
  'they',
  'we',
  'what',
  'where',
  'who',
  'why',
  'you',
]);
const NON_POSSESSIVE_FOLLOWERS = new Set([
  'a',
  'an',
  'are',
  'be',
  'been',
  'being',
  'by',
  'can',
  'for',
  'from',
  'he',
  'her',
  'him',
  'his',
  'i',
  'if',
  'in',
  'could',
  'did',
  'do',
  'does',
  'it',
  'its',
  'had',
  'has',
  'have',
  'is',
  'of',
  'on',
  'or',
  'our',
  'may',
  'might',
  'must',
  'shall',
  'should',
  'that',
  'the',
  'their',
  'them',
  'they',
  'this',
  'those',
  'to',
  'us',
  'was',
  'we',
  'were',
  'will',
  'would',
  'you',
  'your',
]);
const NON_FRAGMENT_WORDS = new Set([
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

function groupByPageAndLine(items: ExtractedTextRun[]): Record<string, ExtractedTextRun[]> {
  const sorted = [...items].sort(
    (a, b) => a.page - b.page || a.y - b.y || a.x - b.x,
  );
  const grouped: Record<string, ExtractedTextRun[]> = {};

  for (const item of sorted) {
    let key = `${item.page}|${item.y.toFixed(2)}`;
    if (!grouped[key]) {
      const existingKey = Object.keys(grouped).find(existing => {
        const [existingPage, existingY] = existing.split('|');
        return (
          Number(existingPage) === item.page &&
          Math.abs(Number(existingY) - item.y) <= LINE_Y_TOLERANCE
        );
      });
      if (existingKey) {
        key = existingKey;
      } else {
        grouped[key] = [];
      }
    }
    grouped[key].push(item);
  }

  return grouped;
}

function mergeRuns(a: ExtractedTextRun, b: ExtractedTextRun, text: string): ExtractedTextRun {
  return {
    ...a,
    text,
    fontSize: Math.max(a.fontSize || 0, b.fontSize || 0) || undefined,
    internalHref: a.internalHref || b.internalHref,
  };
}

function startsWithLowercaseWord(value: string): boolean {
  return /^[a-z][a-z'’ -]*/.test(value);
}

function isLikelyFragment(value: string): boolean {
  if (!/^[A-Za-z]{1,4}$/.test(value)) {
    return false;
  }
  return !NON_FRAGMENT_WORDS.has(value.toLowerCase());
}

function shouldUseApostropheS(baseWord: string, followingWord: string): boolean {
  const base = baseWord.toLowerCase();
  if (CONTRACTION_S_BASES.has(base)) {
    return true;
  }
  if (!followingWord) {
    return false;
  }
  if (NON_POSSESSIVE_FOLLOWERS.has(followingWord.toLowerCase())) {
    return false;
  }
  return /^[a-z][a-z'’-]+$/.test(followingWord);
}

function normalizeInlineSplitText(text: string): string {
  return text
    .replace(
      /\b(it|here|how|let|that|there|what|when|where|who|why)\s+s\b/gi,
      "$1's",
    )
    .replace(/\b([b-hj-z])\s+([a-z]{2,})\b/g, (match, left, right, offset, source) => {
      if (offset === 0) {
        return match;
      }
      const prevChar = source[offset - 1];
      if (prevChar === "'" || prevChar === '’') {
        return match;
      }
      return `${left}${right}`;
    })
    .replace(/\b([A-Za-z]{3,})\s+([b-hj-z])\b(?=\s+[a-z])/g, '$1$2');
}

function cleanupLineRuns(lineRuns: ExtractedTextRun[]): ExtractedTextRun[] {
  const sorted = [...lineRuns]
    .sort((a, b) => a.x - b.x)
    .map(run => ({
      ...run,
      text: normalizeInlineSplitText(run.text),
    }));
  const cleaned: ExtractedTextRun[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const next2 = sorted[i + 2];
    const prev = sorted[i - 1];
    const currentText = current.text.trim();
    const currentLower = currentText.toLowerCase();
    const nextText = next?.text.trim() || '';
    const next2Text = next2?.text.trim() || '';
    const gap = next ? next.x - current.x : Infinity;
    const prevGap = prev ? current.x - prev.x : Infinity;

    if (
      next &&
      gap <= SMALL_GAP &&
      /^[A-Za-z]{2,}$/.test(currentText) &&
      /^s$/i.test(nextText) &&
      (!NON_FRAGMENT_WORDS.has(currentLower) || CONTRACTION_S_BASES.has(currentLower))
    ) {
      const merged = shouldUseApostropheS(currentText, next2Text)
        ? `${currentText}'s`
        : `${currentText}s`;
      cleaned.push(mergeRuns(current, next, merged));
      i += 1;
      continue;
    }

    if (next && gap <= PHRASE_FRAGMENT_GAP) {
      const trailingFragment = currentText.match(/^(.*\s)([a-z])$/);
      if (
        trailingFragment &&
        !NON_FRAGMENT_WORDS.has(trailingFragment[2]) &&
        startsWithLowercaseWord(nextText)
      ) {
        cleaned.push(
          mergeRuns(current, next, `${trailingFragment[1]}${trailingFragment[2]}${nextText}`),
        );
        i += 1;
        continue;
      }
    }

    if (next && gap <= PHRASE_FRAGMENT_GAP) {
      const currentLastWordMatch = currentText.match(/([A-Za-z]{3,})$/);
      const currentLastWord = currentLastWordMatch?.[1];
      const nextStartsWithSingleLetter = nextText.match(/^([a-z])\s+(.+)$/);
      const nextStartsWithApostropheFragment = nextText.match(/^([a-z])(['’]s.*)$/);

      if (currentLastWord && nextStartsWithSingleLetter) {
        const lead = nextStartsWithSingleLetter[1];
        const rest = nextStartsWithSingleLetter[2];
        if (!NON_FRAGMENT_WORDS.has(lead)) {
          if (lead === 's') {
            const followingWord = rest.match(/^([A-Za-z]+)/)?.[1] || '';
            const merged = shouldUseApostropheS(currentLastWord, followingWord)
              ? `${currentText}'s ${rest}`
              : `${currentText}s ${rest}`;
            cleaned.push(mergeRuns(current, next, merged));
          } else {
            cleaned.push(mergeRuns(current, next, `${currentText}${lead} ${rest}`));
          }
          i += 1;
          continue;
        }
      }

      if (currentLastWord && nextStartsWithApostropheFragment) {
        const lead = nextStartsWithApostropheFragment[1];
        const suffix = nextStartsWithApostropheFragment[2];
        if (!NON_FRAGMENT_WORDS.has(lead)) {
          cleaned.push(mergeRuns(current, next, `${currentText}${lead}${suffix}`));
          i += 1;
          continue;
        }
      }
    }

    if (
      next &&
      gap <= SMALL_GAP &&
      /^[A-Za-z]{2,}$/.test(currentText) &&
      /^t$/i.test(nextText) &&
      /n$/i.test(currentText)
    ) {
      cleaned.push(mergeRuns(current, next, `${currentText}'t`));
      i += 1;
      continue;
    }

    if (
      next &&
      gap <= SMALL_GAP &&
      /^[A-Za-z]{1,}$/.test(currentText) &&
      /^(?:re|ve|ll|d|m)$/i.test(nextText) &&
      PRONOUN_CONTRACTION_BASES.has(currentText.toLowerCase())
    ) {
      cleaned.push(mergeRuns(current, next, `${currentText}'${nextText}`));
      i += 1;
      continue;
    }

    if (
      next &&
      gap <= SMALL_GAP &&
      /^[a-z]$/.test(currentText) &&
      !NON_FRAGMENT_WORDS.has(currentLower) &&
      startsWithLowercaseWord(nextText)
    ) {
      cleaned.push(mergeRuns(current, next, `${currentText}${nextText}`));
      i += 1;
      continue;
    }

    if (
      next &&
      gap <= SMALL_GAP &&
      /[A-Za-z]-$/.test(currentText) &&
      /^[a-z]{2,}$/.test(nextText)
    ) {
      cleaned.push(
        mergeRuns(current, next, `${currentText.slice(0, -1)}${nextText}`),
      );
      i += 1;
      continue;
    }

    // Repair single-letter splits by attaching the fragment to the closer side.
    if (
      prev &&
      /^[a-z]$/.test(currentText) &&
      !NON_FRAGMENT_WORDS.has(currentLower) &&
      cleaned.length > 0
    ) {
      const prevLower = prev.text.trim().toLowerCase();
      const canMergePrev =
        (prevGap <= FRAGMENT_JOIN_GAP ||
          (prevGap <= SMALL_GAP && NON_FRAGMENT_WORDS.has(nextText.toLowerCase()))) &&
        /^[A-Za-z]{3,}$/.test(prev.text.trim());
      const canMergeNext =
        !!next &&
        (gap <= FRAGMENT_JOIN_GAP ||
          (gap <= SMALL_GAP && NON_FRAGMENT_WORDS.has(prevLower))) &&
        startsWithLowercaseWord(nextText);

      if (canMergeNext && canMergePrev) {
        const letter = currentText.toLowerCase();
        if (PREFER_PREV_SINGLE_LETTERS.has(letter)) {
          cleaned[cleaned.length - 1] = mergeRuns(
            cleaned[cleaned.length - 1],
            current,
            `${cleaned[cleaned.length - 1].text.trim()}${currentText}`,
          );
          continue;
        }
        if (PREFER_NEXT_SINGLE_LETTERS.has(letter)) {
          cleaned.push(mergeRuns(current, next!, `${currentText}${nextText}`));
          i += 1;
          continue;
        }
      }

      if (canMergeNext && (!canMergePrev || gap < prevGap)) {
        cleaned.push(mergeRuns(current, next!, `${currentText}${nextText}`));
        i += 1;
        continue;
      }

      if (canMergePrev) {
        cleaned[cleaned.length - 1] = mergeRuns(
          cleaned[cleaned.length - 1],
          current,
          `${cleaned[cleaned.length - 1].text.trim()}${currentText}`,
        );
        continue;
      }
    }

    if (
      next &&
      gap <= FRAGMENT_JOIN_GAP &&
      isLikelyFragment(currentText) &&
      startsWithLowercaseWord(nextText)
    ) {
      cleaned.push(mergeRuns(current, next, `${currentText}${nextText}`));
      i += 1;
      continue;
    }

    // Repair split like "Playe" + "r's".
    if (
      next &&
      gap <= SMALL_GAP &&
      /^[A-Za-z]{3,}$/.test(currentText) &&
      /^(?:[a-z]{2,}|[a-z]+['’](?:s|[a-z]+))$/.test(nextText)
    ) {
      cleaned.push(mergeRuns(current, next, `${currentText}${nextText}`));
      i += 1;
      continue;
    }

    if (currentText === "'" && startsWithLowercaseWord(nextText) && gap <= SMALL_GAP) {
      continue;
    }

    if (
      currentText === '-' &&
      next &&
      gap <= FRAGMENT_JOIN_GAP &&
      /^[a-z]$/.test(nextText)
    ) {
      continue;
    }

    if (current.internalHref && /^\.+$/.test(currentText)) {
      continue;
    }

    cleaned.push(current);
  }

  return cleaned;
}

export function applyFocusedCleanup(
  items: ExtractedTextRun[],
  targetPages: Set<number>,
): ExtractedTextRun[] {
  const grouped = groupByPageAndLine(items);
  const output: ExtractedTextRun[] = [];

  Object.keys(grouped).forEach(key => {
    const [pageText] = key.split('|');
    const page = Number(pageText);
    const lineRuns = grouped[key];
    if (!targetPages.has(page)) {
      output.push(...lineRuns);
      return;
    }

    output.push(...cleanupLineRuns(lineRuns));
  });

  return output.sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
}
