import {RulesSearchIndex, RulesSection} from './types';

export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map(token => token.replace(/[^a-z0-9]/g, '').trim())
    .filter(Boolean);
}

function intersect(a: Set<string>, b: Set<string>): Set<string> {
  const output = new Set<string>();
  a.forEach(value => {
    if (b.has(value)) {
      output.add(value);
    }
  });
  return output;
}

function tokenKeysForQueryToken(index: RulesSearchIndex, token: string): string[] {
  if (!token) {
    return [];
  }

  if (index.tokenMap[token]) {
    return [token];
  }

  // Prefix fallback: supports partial terms like "circulat" -> "circulate".
  if (token.length < 3) {
    return [];
  }

  return Object.keys(index.tokenMap).filter(key => key.startsWith(token));
}

export function findMatchingSectionIds(
  index: RulesSearchIndex,
  query: string,
): Set<string> {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) {
    return new Set<string>();
  }

  let matches: Set<string> | null = null;
  tokens.forEach(token => {
    const postingKeys = tokenKeysForQueryToken(index, token);
    const postings = postingKeys.flatMap(key => index.tokenMap[key] || []);
    const tokenMatches = new Set<string>(postings.map(posting => posting.sectionId));
    matches = matches ? intersect(matches, tokenMatches) : tokenMatches;
  });

  return matches || new Set<string>();
}

export function countQueryHits(
  index: RulesSearchIndex,
  query: string,
  sectionIds?: Set<string>,
): number {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) {
    return 0;
  }

  const seen = new Set<string>();
  tokens.forEach(token => {
    const postingKeys = tokenKeysForQueryToken(index, token);
    postingKeys.forEach(key => {
      const postings = index.tokenMap[key] || [];
      postings.forEach(posting => {
        if (sectionIds && !sectionIds.has(posting.sectionId)) {
          return;
        }
        seen.add(
          `${posting.sectionId}:${posting.sectionIndex}:${posting.blockIndex}:${posting.tokenPosition}`,
        );
      });
    });
  });

  return seen.size;
}

export function filterSectionsByQuery(
  sections: RulesSection[],
  index: RulesSearchIndex,
  query: string,
): RulesSection[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return sections;
  }

  const queryLower = trimmed.toLowerCase();
  const byToken = findMatchingSectionIds(index, queryLower);

  return sections.filter(section => {
    if (byToken.has(section.id)) {
      return true;
    }

    return section.title.toLowerCase().includes(queryLower);
  });
}
