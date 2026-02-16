import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';
import {countQueryHits, filterSectionsByQuery, findMatchingSectionIds} from '../../lib/rules/search';
import {
  RulesDocument,
  RulesSearchIndex,
  RulesSection,
  TocEntry,
} from '../../lib/rules/types';
import styles from '../../styles/RulesScreenStyles';
import RulesToc from './RulesToc';
import RulesDocumentView, {RulesDocumentViewHandle} from './RulesDocumentView';
import RulesSearchFooter from './RulesSearchFooter';

interface RulesScreenProps {
  documentOverride?: RulesDocument;
  indexOverride?: RulesSearchIndex;
}

const fallbackTheme: Theme = {
  name: 'dark',
  backgroundColor: '#000000',
  foregroundColor: '#FFFFFF',
  dividerColor: '#444444',
  translucentBackgroundColor: 'rgba(0,0,0,0.5)',
};

function formatVisiblePagesLabel(pages: number[]): string {
  if (!pages.length) {
    return 'Page -';
  }
  const sorted = Array.from(new Set(pages)).sort((left, right) => left - right);
  if (sorted.length === 1) {
    return `Page ${sorted[0]}`;
  }
  return `Pages ${sorted[0]}-${sorted[sorted.length - 1]}`;
}

const fileDocument = require('../../data/rules/rules.document.json') as RulesDocument;
const fileIndex = require('../../data/rules/rules.index.json') as RulesSearchIndex;

function isSourceTocSection(section: RulesSection): boolean {
  const title = String(section.title || '').toLowerCase();
  if (title.includes('table of contents') || title === 'contents') {
    return true;
  }

  if (section.pageRef > 3) {
    return false;
  }

  const paragraphTexts = section.blocks
    .filter(block => block.type === 'paragraph')
    .map(block => block.textRuns.map(run => run.text).join(' ').replace(/\s+/g, ' ').trim())
    .filter(text => text.length > 0);

  const tocLikeCount = paragraphTexts.filter(text => {
    return (
      /\.\.{3,}/.test(text) ||
      /^section\s+[a-z]\./i.test(text) ||
      /\bsection\s+[a-z]\./i.test(text) ||
      /\bchapter\s+\d+\b/i.test(text)
    );
  }).length;

  return tocLikeCount >= 2;
}

const RulesScreen = ({documentOverride, indexOverride}: RulesScreenProps) => {
  const theme = useContext<Theme | null>(ThemeContext) || fallbackTheme;
  const [draftQuery, setDraftQuery] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hitProgress, setHitProgress] = useState<{current: number; total: number}>({
    current: 0,
    total: 0,
  });
  const [showToc, setShowToc] = useState<boolean>(false);
  const [collapsedTocAnchors, setCollapsedTocAnchors] = useState<Set<string>>(new Set());
  const [visiblePagesLabel, setVisiblePagesLabel] = useState<string>('Page -');
  const visiblePagesLabelRef = useRef<string>('Page -');
  const documentRef = useRef<RulesDocumentViewHandle>(null);

  const sourceDocument = documentOverride || fileDocument;
  const rulesDocument = useMemo(
    () => ({
      ...sourceDocument,
      sections: sourceDocument.sections.filter(section => !isSourceTocSection(section)),
      toc: sourceDocument.toc.filter(entry => !/^(?:contents|table of contents)$/i.test(entry.title)),
    }),
    [sourceDocument],
  );
  const rulesIndex = indexOverride || fileIndex;

  const filteredSections: RulesSection[] = useMemo(
    () => filterSectionsByQuery(rulesDocument.sections, rulesIndex, query),
    [rulesDocument.sections, rulesIndex, query],
  );
  const searchMetrics = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return {hitCount: 0};
    }

    const tokenSectionIds = findMatchingSectionIds(rulesIndex, trimmed);
    const hitCount = countQueryHits(rulesIndex, trimmed, tokenSectionIds);
    return {hitCount};
  }, [query, rulesIndex]);
  const visibleAnchors = useMemo(
    () => new Set(filteredSections.map(section => section.anchor)),
    [filteredSections],
  );
  const visibleToc: TocEntry[] = useMemo(() => {
    if (!query.trim()) {
      return rulesDocument.toc;
    }

    return rulesDocument.toc.filter(entry => visibleAnchors.has(entry.anchor));
  }, [rulesDocument.toc, visibleAnchors, query]);
  const hitProgressLabel = useMemo(() => {
    if (!query.trim()) {
      return '';
    }
    if (!hitProgress.total) {
      return '0/0';
    }
    return `${hitProgress.current}/${hitProgress.total}`;
  }, [query, hitProgress]);

  useEffect(() => {
    const progress = documentRef.current?.resetQueryHitCursor();
    setHitProgress(progress || {current: 0, total: 0});
  }, [query, filteredSections]);

  useEffect(() => {
    if (isSearching) {
      setIsSearching(false);
    }
  }, [isSearching, query, filteredSections]);

  const submitSearch = useCallback(() => {
    const trimmed = draftQuery.trim();
    setIsSearching(true);
    setQuery(trimmed);
  }, [draftQuery]);

  const onAnchorPress = (anchor: string) => {
    documentRef.current?.scrollToAnchor(anchor);
    setShowToc(false);
  };
  const onPrevHit = () => {
    const progress = documentRef.current?.jumpToQueryHit('prev');
    if (progress) {
      setHitProgress(progress);
    }
  };
  const onNextHit = () => {
    const progress = documentRef.current?.jumpToQueryHit('next');
    if (progress) {
      setHitProgress(progress);
    }
  };
  const handleVisiblePagesChange = useCallback((pages: number[]) => {
    const nextLabel = formatVisiblePagesLabel(pages);
    if (nextLabel === visiblePagesLabelRef.current) {
      return;
    }
    visiblePagesLabelRef.current = nextLabel;
    setVisiblePagesLabel(nextLabel);
  }, []);

  if (!rulesDocument.sections.length) {
    return (
      <View
        style={{
          ...styles.emptyState,
          backgroundColor: theme.backgroundColor,
        }}>
        <Text style={{...styles.emptyText, color: theme.foregroundColor}}>
          Rules data is not available yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={{...styles.container, backgroundColor: theme.backgroundColor}}>
      {showToc && (
        <RulesToc
          entries={visibleToc}
          onAnchorPress={onAnchorPress}
          theme={theme}
          collapsedAnchors={collapsedTocAnchors}
          onToggleCollapsed={anchor =>
            setCollapsedTocAnchors(current => {
              const next = new Set(current);
              if (next.has(anchor)) {
                next.delete(anchor);
              } else {
                next.add(anchor);
              }
              return next;
            })
          }
          onClose={() => setShowToc(false)}
        />
      )}
      {filteredSections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{...styles.emptyText, color: theme.foregroundColor}}>
            No matching rules found.
          </Text>
        </View>
      ) : (
        <RulesDocumentView
          ref={documentRef}
          sections={filteredSections}
          query={query}
          theme={theme}
          onVisiblePagesChange={handleVisiblePagesChange}
        />
      )}
      <RulesSearchFooter
        draftQuery={draftQuery}
        query={query}
        onDraftQueryChange={setDraftQuery}
        onSubmitQuery={submitSearch}
        isSearching={isSearching}
        onClearQuery={() => {
          setDraftQuery('');
          setQuery('');
          setIsSearching(false);
          setHitProgress({current: 0, total: 0});
        }}
        showToc={showToc}
        onToggleToc={() => setShowToc(value => !value)}
        filteredCount={filteredSections.length}
        totalCount={rulesDocument.sections.length}
        hitCount={searchMetrics.hitCount}
        onPrevHit={onPrevHit}
        onNextHit={onNextHit}
        hitProgressLabel={hitProgressLabel}
        visiblePagesLabel={visiblePagesLabel}
      />
    </View>
  );
};

export default RulesScreen;
