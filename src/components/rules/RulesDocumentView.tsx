import React, {
  useCallback,
  useEffect,
  ForwardedRef,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Modal,
  Pressable,
  Text,
  View,
  ViewToken,
} from 'react-native';
import AllCardsContext from '../../contexts/AllCardsContext';
import Card from '../../models/Card';
import {Theme} from '../../types/interfaces';
import {RulesSection, RulesTextRun} from '../../lib/rules/types';
import styles from '../../styles/RulesScreenStyles';
import {rulesFontFamilies, rulesFontFamilyForTraits} from '../../styles/rulesTypography';

interface RulesDocumentViewProps {
  sections: RulesSection[];
  query: string;
  theme: Theme;
  onAnchorNavigation?: (anchor: string) => void;
  onVisiblePagesChange?: (pages: number[]) => void;
}

export interface RulesDocumentViewHandle {
  scrollToAnchor: (anchor: string) => void;
  jumpToQueryHit: (direction: 'next' | 'prev') => {current: number; total: number};
  resetQueryHitCursor: () => {current: number; total: number};
}

interface HighlightPart {
  text: string;
  highlighted: boolean;
}

interface CardLinkMatch {
  title: string;
  imageUrl: string;
}

interface TextSegment {
  text: string;
  cardLink?: CardLinkMatch;
  anchorLink?: string;
}

interface HeadingChunk {
  type: 'heading';
  anchor: string;
  text: string;
}

interface ParagraphChunk {
  type: 'paragraph';
  anchor: string;
  blockIndex: number;
  runs: RulesTextRun[];
}

interface ImageChunk {
  type: 'image';
  anchor: string;
  imageUri: string;
  imageCaption?: string;
  imageWidth?: number;
  imageHeight?: number;
}

type PageChunk = HeadingChunk | ParagraphChunk | ImageChunk;

interface PageRow {
  key: string;
  page: number;
  chunks: PageChunk[];
}

const RULES_LINK_COLOR = '#2F6BFF';

function canonicalApostrophe(character: string): string {
  return /[’`´]/.test(character) ? "'" : character;
}

function startsWithCardTitle(text: string, index: number, title: string): boolean {
  if (index + title.length > text.length) {
    return false;
  }
  for (let offset = 0; offset < title.length; offset += 1) {
    const source = canonicalApostrophe(text[index + offset]);
    const target = canonicalApostrophe(title[offset]);
    if (source !== target) {
      return false;
    }
  }
  return true;
}

function stripLeadingUniquenessMarkers(title: string): string {
  return title.replace(/^[•◆◇◊\*]+/, '').trimStart();
}

function cardTitleAliases(title: string): string[] {
  const value = String(title || '').trim();
  if (!value) {
    return [];
  }
  const stripped = stripLeadingUniquenessMarkers(value);
  if (stripped && stripped !== value) {
    return [value, stripped];
  }
  return [value];
}

function splitHighlight(text: string, query: string): HighlightPart[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [{text, highlighted: false}];
  }

  const sourceLower = text.toLowerCase();
  const parts: HighlightPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const hit = sourceLower.indexOf(normalized, cursor);
    if (hit === -1) {
      parts.push({text: text.slice(cursor), highlighted: false});
      break;
    }

    if (hit > cursor) {
      parts.push({text: text.slice(cursor, hit), highlighted: false});
    }

    parts.push({
      text: text.slice(hit, hit + normalized.length),
      highlighted: true,
    });
    cursor = hit + normalized.length;
  }

  return parts.filter(part => part.text.length > 0);
}

function isBulletLine(text: string): boolean {
  return /^\s*(?:[-*•]|\d+\.)\s+/.test(text);
}

function isBoundaryCharacter(character?: string): boolean {
  if (!character) {
    return true;
  }
  return !/[A-Za-z0-9]/.test(character);
}

function hasTokenBoundary(text: string, startIndex: number, endIndex: number): boolean {
  const previousChar = startIndex > 0 ? text[startIndex - 1] : undefined;
  const nextChar = endIndex < text.length ? text[endIndex] : undefined;
  return isBoundaryCharacter(previousChar) && isBoundaryCharacter(nextChar);
}

function splitCardTitleSegments(
  text: string,
  titlesByLeadingCharacter: Map<string, CardLinkMatch[]>,
): TextSegment[] {
  if (text.length === 0) {
    return [{text}];
  }

  const output: TextSegment[] = [];
  let cursor = 0;
  let plainStart = 0;

  while (cursor < text.length) {
    const leadingCharacter = canonicalApostrophe(text[cursor]);
    const candidates = titlesByLeadingCharacter.get(leadingCharacter) || [];
    let matchedCard: CardLinkMatch | null = null;

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const endIndex = cursor + candidate.title.length;
      if (!startsWithCardTitle(text, cursor, candidate.title)) {
        continue;
      }
      if (!hasTokenBoundary(text, cursor, endIndex)) {
        continue;
      }
      matchedCard = candidate;
      break;
    }

    if (!matchedCard) {
      cursor += 1;
      continue;
    }

    if (plainStart < cursor) {
      output.push({text: text.slice(plainStart, cursor)});
    }
    output.push({
      text: text.slice(cursor, cursor + matchedCard.title.length),
      cardLink: matchedCard,
    });
    cursor += matchedCard.title.length;
    plainStart = cursor;
  }

  if (plainStart < text.length) {
    output.push({text: text.slice(plainStart)});
  }

  return output.length ? output : [{text}];
}

function isUniqueSymbolBullet(
  text: string,
  bulletIndex: number,
  titlesByLeadingCharacter: Map<string, CardLinkMatch[]>,
): boolean {
  let previous = bulletIndex - 1;
  while (previous >= 0 && /\s/.test(text[previous])) {
    previous -= 1;
  }
  if (previous >= 0 && text[previous] === '(') {
    return true;
  }

  let titleStart = bulletIndex + 1;
  while (titleStart < text.length && /\s/.test(text[titleStart])) {
    titleStart += 1;
  }
  if (titleStart >= text.length) {
    return false;
  }

  const leadingCharacter = canonicalApostrophe(text[titleStart]);
  const candidates = titlesByLeadingCharacter.get(leadingCharacter) || [];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const endIndex = titleStart + candidate.title.length;
    if (!startsWithCardTitle(text, titleStart, candidate.title)) {
      continue;
    }
    if (!hasTokenBoundary(text, titleStart, endIndex)) {
      continue;
    }
    return true;
  }

  return false;
}

function forceListBulletsToNewLine(
  text: string,
  titlesByLeadingCharacter: Map<string, CardLinkMatch[]>,
): string {
  if (!text.includes('•')) {
    return text;
  }

  let output = '';
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (char !== '•') {
      output += char;
      index += 1;
      continue;
    }

    if (
      isUniqueSymbolBullet(text, index, titlesByLeadingCharacter) ||
      output.length === 0 ||
      output.endsWith('\n')
    ) {
      output += '•';
      index += 1;
      continue;
    }

    output = output.replace(/[ \t]+$/, '');
    output += '\n•';
    index += 1;
  }

  return output;
}

function normalizeReferenceKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/\bch\.?\s*\d+[a-z]?\b/gi, '')
    .replace(/\bappendix\s+[a-z]\b/gi, match => match.toLowerCase())
    .replace(/[^a-z0-9&':,\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function referenceCandidates(value: string): string[] {
  const source = String(value || '').trim();
  if (!source) {
    return [];
  }
  const firstClause = source.split(/[.;)]/)[0].trim();
  const beforeComma = firstClause.split(',')[0].trim();
  const noLeadingSee = firstClause.replace(/^see\s+/i, '').trim();
  const noChapterRef = noLeadingSee.replace(/\bch\.?\s*\d+[a-z]?\b/gi, '').trim();
  const candidates = [firstClause, noLeadingSee, beforeComma, noChapterRef]
    .map(candidate => normalizeReferenceKey(candidate))
    .filter(candidate => candidate.length > 0);
  return Array.from(new Set(candidates));
}

function buildSectionReferenceMap(sections: RulesSection[]): Map<string, string> {
  const output = new Map<string, string>();

  sections.forEach(section => {
    const title = String(section.title || '').trim();
    if (!title || !section.anchor) {
      return;
    }

    const variants = new Set<string>([
      normalizeReferenceKey(title),
      ...referenceCandidates(title),
    ]);

    const simplified = title.replace(/^chapter\s+\d+\s*[-:]\s*/i, '').trim();
    if (simplified) {
      variants.add(normalizeReferenceKey(simplified));
      referenceCandidates(simplified).forEach(candidate => variants.add(candidate));
    }

    variants.forEach(variant => {
      if (variant && !output.has(variant)) {
        output.set(variant, section.anchor);
      }
    });
  });

  return output;
}

function splitSeeReferenceSegments(
  text: string,
  sectionReferences: Map<string, string>,
): TextSegment[] {
  if (!text || sectionReferences.size === 0) {
    return [{text}];
  }

  const segments: TextSegment[] = [];
  const pattern = /\bSee\s+([^.;)\n]{2,120})(?=[.;)\n]|$)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const targetRaw = match[1];
    const start = match.index;
    const end = start + fullMatch.length;
    const candidates = referenceCandidates(targetRaw);
    const anchor = candidates
      .map(candidate => sectionReferences.get(candidate))
      .find(value => typeof value === 'string');

    if (!anchor) {
      continue;
    }

    if (start > cursor) {
      segments.push({text: text.slice(cursor, start)});
    }
    segments.push({
      text: fullMatch,
      anchorLink: anchor,
    });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({text: text.slice(cursor)});
  }

  return segments.length > 0 ? segments : [{text}];
}

function normalizeParagraphRunsForDisplay(runs: RulesTextRun[]): RulesTextRun[] {
  const normalized: RulesTextRun[] = [];

  for (let index = 0; index < runs.length; index += 1) {
    const current = runs[index];
    const next = runs[index + 1];
    const nextTwo = runs[index + 2];

    // Fix OCR split around glossary term "Re-circulating" into ["Re", "-", "circulating"].
    if (
      current?.bold &&
      current.text.trim().toLowerCase() === 're' &&
      next &&
      /^\s*-+\s*$/.test(next.text) &&
      nextTwo?.bold &&
      nextTwo.text.trim().toLowerCase() === 'circulating'
    ) {
      normalized.push({...current, text: 'Re-circulating'});
      index += 2;
      continue;
    }

    const cleanText = current.text
      .replace(/\bRe\s*[\n\r]+\s*-\s*circulating\b/gi, 'Re-circulating')
      .replace(/\bRe\s*-\s*circulating\b/gi, 'Re-circulating');

    // Convert malformed glossary run "Hand All cards..." into term + definition.
    if (current.bold && !cleanText.includes('\n')) {
      const glossaryMatch = cleanText.trim().match(/^([A-Z][A-Za-z'’\-]+)\s+(.+)$/);
      const definitionStarter = /^(All|Act|A|An|The|Any|One|Two|Three|When|If|You|Each)\b/;
      if (
        glossaryMatch &&
        !/\s/.test(glossaryMatch[1]) &&
        definitionStarter.test(glossaryMatch[2])
      ) {
        normalized.push({...current, text: glossaryMatch[1]});
        normalized.push({text: `\n${glossaryMatch[2]}`});
        continue;
      }
    }

    normalized.push({...current, text: cleanText});
  }

  for (let index = 1; index < normalized.length; index += 1) {
    const previous = normalized[index - 1];
    const current = normalized[index];
    if (
      /[A-Za-z0-9.)]$/.test(previous.text) &&
      /^[A-Za-z0-9(]/.test(current.text)
    ) {
      current.text = ` ${current.text}`;
    }
  }

  return normalized;
}

function pageTextForSearch(row: PageRow): string {
  return row.chunks
    .map(chunk => {
      if (chunk.type === 'heading') {
        return chunk.text;
      }
      if (chunk.type === 'image') {
        return chunk.imageCaption || '';
      }
      return chunk.runs.map(run => run.text).join(' ');
    })
    .join(' ');
}

const RulesDocumentView = forwardRef(
  (
    {sections, query, theme, onAnchorNavigation, onVisiblePagesChange}: RulesDocumentViewProps,
    ref: ForwardedRef<RulesDocumentViewHandle>,
  ) => {
    const allCards = useContext(AllCardsContext);
    const [selectedCard, setSelectedCard] = useState<CardLinkMatch | null>(null);
    const listRef = useRef<FlatList<PageRow>>(null);
    const anchorIndexRef = useRef<Record<string, number>>({});
    const queryHitCursorRef = useRef<number>(-1);
    const visiblePagesKeyRef = useRef<string>('');
    const pendingScrollIndexRef = useRef<number | null>(null);

    const cardTitlesByLeadingCharacter = useMemo(() => {
      const map = new Map<string, CardLinkMatch[]>();
      const safeCards = Array.isArray(allCards) ? allCards : [];

      safeCards.forEach((card: Card) => {
        if (!card?.title || !card?.imageUrl) {
          return;
        }

        const aliases = cardTitleAliases(card.title);
        aliases.forEach(alias => {
          const leadingCharacter = alias[0];
          if (!leadingCharacter) {
            return;
          }

          const canonicalLeadingCharacter = canonicalApostrophe(leadingCharacter);
          const cardMatch: CardLinkMatch = {
            title: alias,
            imageUrl: card.imageUrl,
          };

          const existing = map.get(canonicalLeadingCharacter);
          if (!existing) {
            map.set(canonicalLeadingCharacter, [cardMatch]);
            return;
          }

          const duplicate = existing.some(
            candidate =>
              candidate.title === cardMatch.title &&
              candidate.imageUrl === cardMatch.imageUrl,
          );
          if (!duplicate) {
            existing.push(cardMatch);
          }
        });
      });

      map.forEach(matches => {
        matches.sort((left, right) => right.title.length - left.title.length);
      });

      return map;
    }, [allCards]);

    const normalizedQuery = useMemo(() => query.trim(), [query]);
    const sectionReferenceMap = useMemo(
      () => buildSectionReferenceMap(sections),
      [sections],
    );

    const rows = useMemo(() => {
      const pageMap = new Map<number, PageChunk[]>();
      const anchorToPage: Record<string, number> = {};

      const appendChunk = (page: number, chunk: PageChunk) => {
        if (!pageMap.has(page)) {
          pageMap.set(page, []);
        }
        pageMap.get(page)?.push(chunk);
      };

      sections.forEach(section => {
        const headingPage = section.pageRef || 1;
        if (typeof anchorToPage[section.anchor] !== 'number') {
          anchorToPage[section.anchor] = headingPage;
        }

        appendChunk(headingPage, {
          type: 'heading',
          anchor: section.anchor,
          text: section.title,
        });

        section.blocks
          .filter(block => block.type !== 'heading')
          .forEach((block, blockIndex) => {
            if (block.type === 'image' && block.image?.uri) {
              const page = block.image.page || block.pageRef || headingPage;
              appendChunk(page, {
                type: 'image',
                anchor: section.anchor,
                imageUri: block.image.uri,
                imageCaption: block.image.caption,
                imageWidth: block.image.width,
                imageHeight: block.image.height,
              });
              return;
            }

            const page = block.pageRef || headingPage;
            appendChunk(page, {
              type: 'paragraph',
              anchor: section.anchor,
              blockIndex,
              runs: block.textRuns,
            });
          });
      });

      const pages = Array.from(pageMap.keys()).sort((left, right) => left - right);
      const pageToIndex: Record<number, number> = {};
      const output = pages.map((page, index) => {
        pageToIndex[page] = index;
        return {
          key: `page-${page}`,
          page,
          chunks: pageMap.get(page) || [],
        } as PageRow;
      });

      const anchorRowMap: Record<string, number> = {};
      Object.keys(anchorToPage).forEach(anchor => {
        const page = anchorToPage[anchor];
        const rowIndex = pageToIndex[page];
        if (typeof rowIndex === 'number') {
          anchorRowMap[anchor] = rowIndex;
        }
      });

      anchorIndexRef.current = anchorRowMap;
      return output;
    }, [sections]);

    const queryHitRowIndexes = useMemo(() => {
      const normalized = normalizedQuery.toLowerCase();
      if (!normalized) {
        return [] as number[];
      }

      const matches: number[] = [];
      rows.forEach((row, index) => {
        const text = pageTextForSearch(row);
        if (text.toLowerCase().includes(normalized)) {
          matches.push(index);
        }
      });
      return matches;
    }, [rows, normalizedQuery]);

    useEffect(() => {
      if (!onVisiblePagesChange) {
        return;
      }
      const pages = rows.length > 0 ? [rows[0].page] : [];
      visiblePagesKeyRef.current = pages.join(',');
      onVisiblePagesChange(pages);
    }, [rows, onVisiblePagesChange]);

    const onViewableItemsChanged = useRef(
      ({viewableItems}: {viewableItems: Array<ViewToken<PageRow>>}) => {
        if (!onVisiblePagesChange) {
          return;
        }

        const pages = viewableItems
          .map(item => item.item?.page)
          .filter((page): page is number => Number.isFinite(page));

        const uniqueSorted = Array.from(new Set(pages)).sort((left, right) => left - right);
        const nextKey = uniqueSorted.join(',');
        if (nextKey === visiblePagesKeyRef.current) {
          return;
        }
        visiblePagesKeyRef.current = nextKey;
        onVisiblePagesChange(uniqueSorted);
      },
    ).current;

    const scrollToAnchor = (anchor: string) => {
      const index = anchorIndexRef.current[anchor];
      if (typeof index !== 'number') {
        return;
      }
      pendingScrollIndexRef.current = index;
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    };

    const jumpToQueryHit = (direction: 'next' | 'prev') => {
      if (!queryHitRowIndexes.length) {
        queryHitCursorRef.current = -1;
        return {current: 0, total: 0};
      }

      const total = queryHitRowIndexes.length;
      if (queryHitCursorRef.current < 0 || queryHitCursorRef.current >= total) {
        queryHitCursorRef.current = direction === 'prev' ? total - 1 : 0;
      } else {
        queryHitCursorRef.current =
          direction === 'prev'
            ? (queryHitCursorRef.current - 1 + total) % total
            : (queryHitCursorRef.current + 1) % total;
      }

      const rowIndex = queryHitRowIndexes[queryHitCursorRef.current];
      listRef.current?.scrollToIndex({
        index: rowIndex,
        animated: true,
        viewPosition: 0.1,
      });

      return {current: queryHitCursorRef.current + 1, total};
    };

    const resetQueryHitCursor = () => {
      queryHitCursorRef.current = -1;
      return {current: 0, total: queryHitRowIndexes.length};
    };

    useImperativeHandle(ref, () => ({
      scrollToAnchor,
      jumpToQueryHit,
      resetQueryHitCursor,
    }));

    const renderParagraphChunk = useCallback((
      chunk: ParagraphChunk,
      runKeyPrefix: string,
    ): React.ReactElement => {
      const displayRuns = normalizeParagraphRunsForDisplay(chunk.runs).map(run => ({
        ...run,
        text: forceListBulletsToNewLine(run.text, cardTitlesByLeadingCharacter),
      }));
      const mergedText = displayRuns.map(run => run.text).join(' ').trim();
      const paragraphStyle = isBulletLine(mergedText) ? styles.bulletText : styles.paragraphText;

      return (
        <Text style={{...paragraphStyle, color: theme.foregroundColor}}>
          {displayRuns.map((run, runIndex) => {
            const hrefAnchor = run.href?.startsWith('#') ? run.href.slice(1) : null;
            const runSegments = hrefAnchor
              ? [{text: run.text, anchorLink: hrefAnchor}]
              : splitSeeReferenceSegments(run.text, sectionReferenceMap).flatMap(segment => {
                  if (segment.anchorLink) {
                    return [segment];
                  }
                  if (cardTitlesByLeadingCharacter.size === 0) {
                    return [segment];
                  }
                  return splitCardTitleSegments(
                    segment.text,
                    cardTitlesByLeadingCharacter,
                  );
                });

            return (
              <Text
                key={`${runKeyPrefix}-${runIndex}`}
                testID={
                  hrefAnchor
                    ? `rules-inline-link-${chunk.anchor}-${chunk.blockIndex}-${runIndex}`
                    : undefined
                }
                onPress={
                  hrefAnchor
                    ? () => {
                        scrollToAnchor(hrefAnchor);
                        onAnchorNavigation?.(hrefAnchor);
                      }
                    : undefined
                }
                      style={
                        hrefAnchor
                          ? {
                              color: RULES_LINK_COLOR,
                              ...styles.linkText,
                              fontFamily: rulesFontFamilyForTraits({
                                bold: run.bold,
                                italic: run.italic,
                              }),
                              ...(run.bold ? {fontWeight: '700' as const} : null),
                              ...(run.italic ? {fontStyle: 'italic' as const} : null),
                            }
                          : {
                              color: theme.foregroundColor,
                              fontFamily: rulesFontFamilyForTraits({
                                bold: run.bold,
                                italic: run.italic,
                              }),
                              ...(run.bold ? {fontWeight: '700' as const} : null),
                              ...(run.italic ? {fontStyle: 'italic' as const} : null),
                            }
                      }>
                {runSegments.map((segment, segmentIndex) => {
                  const textParts = normalizedQuery
                    ? splitHighlight(segment.text, normalizedQuery)
                    : [{text: segment.text, highlighted: false}];

                  return (
                    <Text
                      key={`${runKeyPrefix}-${runIndex}-${segmentIndex}`}
                      testID={
                        segment.cardLink
                          ? `rules-card-link-${chunk.anchor}-${chunk.blockIndex}-${runIndex}-${segmentIndex}`
                          : segment.anchorLink
                          ? `rules-see-link-${chunk.anchor}-${chunk.blockIndex}-${runIndex}-${segmentIndex}`
                          : undefined
                      }
                      onPress={
                        segment.cardLink
                          ? () => setSelectedCard(segment.cardLink || null)
                          : segment.anchorLink
                          ? () => {
                              scrollToAnchor(segment.anchorLink);
                              onAnchorNavigation?.(segment.anchorLink);
                            }
                          : undefined
                      }
                      style={
                        segment.cardLink || segment.anchorLink
                          ? {
                              color: RULES_LINK_COLOR,
                              ...styles.linkText,
                              fontFamily: rulesFontFamilies.regular,
                            }
                          : {color: theme.foregroundColor}
                      }>
                      {textParts.map((part, partIndex) => (
                        <Text
                          key={`${runKeyPrefix}-${runIndex}-${segmentIndex}-${partIndex}`}
                          style={
                            part.highlighted
                              ? {
                                  color: theme.foregroundColor,
                                  ...styles.highlightText,
                                }
                                    : {color: theme.foregroundColor}
                                }>
                                {part.text}
                        </Text>
                      ))}
                    </Text>
                  );
                })}
              </Text>
            );
          })}
        </Text>
      );
    }, [
      cardTitlesByLeadingCharacter,
      normalizedQuery,
      onAnchorNavigation,
      sectionReferenceMap,
      theme.foregroundColor,
    ]);

    const renderPageRow = useCallback(({item}: ListRenderItemInfo<PageRow>) => {
      return (
        <View
          testID={`rules-page-card-${item.page}`}
          style={{
            ...styles.pageCard,
            borderColor: theme.dividerColor,
            backgroundColor: theme.translucentBackgroundColor,
          }}>
          {item.chunks.map((chunk, index) => {
            if (chunk.type === 'heading') {
              return (
                <View
                  key={`${item.page}-heading-${index}`}
                  testID={`rules-section-${chunk.anchor}`}
                  style={styles.pageHeadingBlock}>
                  <Text style={{...styles.headingText, color: theme.foregroundColor}}>{chunk.text}</Text>
                </View>
              );
            }

            if (chunk.type === 'image') {
              const aspectRatio =
                chunk.imageWidth && chunk.imageHeight && chunk.imageWidth > 0 && chunk.imageHeight > 0
                  ? chunk.imageWidth / chunk.imageHeight
                  : undefined;
              return (
                <View
                  key={`${item.page}-image-${index}`}
                  style={{
                    ...styles.imageBlock,
                    borderColor: theme.dividerColor,
                    backgroundColor: theme.translucentBackgroundColor,
                  }}>
                  <Image
                    source={{uri: chunk.imageUri}}
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      ...(aspectRatio
                        ? {aspectRatio, minHeight: 220, maxHeight: 460}
                        : {height: chunk.imageUri && chunk.imageUri.length > 0 ? 240 : 220}),
                    }}
                  />
                  {chunk.imageCaption ? (
                    <Text style={{...styles.imageCaption, color: theme.foregroundColor}}>
                      {chunk.imageCaption}
                    </Text>
                  ) : null}
                </View>
              );
            }

            return (
              <View key={`${item.page}-paragraph-${index}`} style={styles.pageParagraphBlock}>
                {renderParagraphChunk(chunk, `${item.page}-${index}`)}
              </View>
            );
          })}

          <View style={{...styles.pageFooter, borderColor: theme.dividerColor}}>
            <Text style={{...styles.pageFooterText, color: theme.foregroundColor}}>Page {item.page}</Text>
          </View>
        </View>
      );
    }, [renderParagraphChunk, theme]);

    return (
      <>
        <FlatList
          testID="rules-document-scroll"
          ref={listRef}
          style={styles.contentContainer}
          contentContainerStyle={{
            ...styles.docContent,
            backgroundColor: theme.backgroundColor,
          }}
          data={rows}
          keyExtractor={item => item.key}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          updateCellsBatchingPeriod={60}
          windowSize={7}
          removeClippedSubviews={true}
          onScrollToIndexFailed={info => {
            const fallbackOffset =
              Math.max(0, info.averageItemLength) * Math.max(0, info.index - 1);
            listRef.current?.scrollToOffset({
              offset: fallbackOffset,
              animated: false,
            });

            const retryIndex =
              pendingScrollIndexRef.current !== null
                ? pendingScrollIndexRef.current
                : info.index;
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: retryIndex,
                animated: true,
                viewPosition: 0,
              });
            }, 80);
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{itemVisiblePercentThreshold: 35}}
          renderItem={renderPageRow}
        />

        <Modal
          visible={Boolean(selectedCard)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedCard(null)}>
          <Pressable
            testID="rules-card-modal-backdrop"
            style={styles.cardModalBackdrop}
            onPress={() => setSelectedCard(null)}>
            <Pressable
              style={{
                ...styles.cardModalContent,
                borderColor: theme.dividerColor,
              }}
              onPress={event => event.stopPropagation()}>
              {selectedCard?.imageUrl ? (
                <Image
                  testID="rules-card-modal-image"
                  source={{uri: selectedCard.imageUrl}}
                  resizeMode="contain"
                  style={styles.cardModalImage}
                />
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  },
);

export default RulesDocumentView;
