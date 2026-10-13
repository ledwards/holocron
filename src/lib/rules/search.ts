import {RulesDocument, RulesBlock, RulesSearchIndex, RulesSection} from './types';

export function rulesBlockText(block: RulesBlock): string {
  return block.text ?? block.textRuns.map(run => run.text).join(' ');
}

export function buildRulesSearchIndex(document: RulesDocument): RulesSearchIndex {
  const tokenMap: RulesSearchIndex['tokenMap'] = {};
  document.sections.forEach((section, sectionIndex) => {
    section.blocks.forEach((block, blockIndex) => {
      tokenizeQuery(rulesBlockText(block)).forEach((token, tokenPosition) => {
        (tokenMap[token] ||= []).push({sectionId: section.id, sectionIndex, blockIndex, tokenPosition});
      });
    });
  });
  return {version: document.version, tokenMap};
}

export interface RulesSearchPreview {
  id: string;
  sectionId: string;
  sectionAnchor: string;
  sectionTitle: string;
  pageRef: number;
  snippet: string;
}

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

    return section.title.toLowerCase().includes(queryLower) ||
      section.blocks.some(block => rulesBlockText(block).toLowerCase().includes(queryLower));
  });
}

function snippetAround(text: string, hitStart: number, hitLength: number): string {
  const source = text.replace(/\s+/g, ' ').trim();
  if (!source) {
    return '';
  }

  const start = Math.max(0, hitStart - 52);
  const end = Math.min(source.length, hitStart + hitLength + 72);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < source.length ? '…' : '';
  return `${prefix}${source.slice(start, end)}${suffix}`;
}

export function buildSearchPreviews(
  sections: RulesSection[],
  query: string,
  maxResults = 120,
): RulesSearchPreview[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  const previews: RulesSearchPreview[] = [];
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex];
    for (let blockIndex = 0; blockIndex < section.blocks.length; blockIndex += 1) {
      const block = section.blocks[blockIndex];
      if (block.type !== 'paragraph' && block.type !== 'heading' && !block.text) {
        continue;
      }
      const text = rulesBlockText(block).replace(/\s+/g, ' ').trim();
      if (!text) {
        continue;
      }
      const textLower = text.toLowerCase();
      let searchIndex = textLower.indexOf(trimmed);
      let hitIndex = 0;
      while (searchIndex !== -1) {
        previews.push({
          id: `${section.id}:${blockIndex}:${searchIndex}:${hitIndex}`,
          sectionId: section.id,
          sectionAnchor: section.anchor,
          sectionTitle: section.title,
          pageRef: block.pageRef || section.pageRef,
          snippet: snippetAround(text, searchIndex, trimmed.length),
        });
        if (previews.length >= maxResults) {
          return previews;
        }
        hitIndex += 1;
        searchIndex = textLower.indexOf(trimmed, searchIndex + trimmed.length);
      }
    }
  }

  return previews;
}
