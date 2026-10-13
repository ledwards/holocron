import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {workspaceLayout} from '../../lib/adaptiveLayout';
import RulesBrowser from './RulesBrowser';
import documentData from '../../data/rules/rules.document.json';
import indexData from '../../data/rules/rules.index.json';
import {PaneIconButton} from '../adaptive/AdaptiveWorkspace';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';
import {
  buildSearchPreviews,
  filterSectionsByQuery,
  RulesSearchPreview,
} from '../../lib/rules/search';
import {
  RulesDocument,
  RulesSearchIndex,
  RulesSection,
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

const fileDocument = documentData as RulesDocument;
const fileIndex = indexData as RulesSearchIndex;

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
    .map(block =>
      block.textRuns
        .map(run => run.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
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
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width);
  const {split, browserWidth} = workspaceLayout(width, window.fontScale);
  const bottomInset = useBottomTabBarHeight();
  const theme = useContext<Theme | null>(ThemeContext) || fallbackTheme;
  const [searchOpen, setSearchOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [hitProgress, setHitProgress] = useState<{
    current: number;
    total: number;
  }>({
    current: 0,
    total: 0,
  });
  const [showToc, setShowToc] = useState<boolean>(false);
  const [collapsedTocAnchors, setCollapsedTocAnchors] = useState<Set<string>>(
    new Set(),
  );
  const [visiblePagesLabel, setVisiblePagesLabel] = useState<string>('Page -');
  const visiblePagesLabelRef = useRef<string>('Page -');
  const documentRef = useRef<RulesDocumentViewHandle>(null);

  const sourceDocument = documentOverride || fileDocument;
  const rulesDocument = useMemo(
    () => ({
      ...sourceDocument,
      sections: sourceDocument.sections.filter(
        section => !isSourceTocSection(section),
      ),
      toc: sourceDocument.toc.filter(
        entry => !/^(?:contents|table of contents)$/i.test(entry.title),
      ),
    }),
    [sourceDocument],
  );
  const rulesIndex = indexOverride || fileIndex;

  const filteredSections: RulesSection[] = useMemo(
    () => filterSectionsByQuery(rulesDocument.sections, rulesIndex, query),
    [rulesDocument.sections, rulesIndex, query],
  );
  const hitProgressLabel = useMemo(() => {
    if (!query.trim()) {
      return '';
    }
    if (!hitProgress.total) {
      return '0 matching pages';
    }
    return `${hitProgress.current} of ${hitProgress.total} pages`;
  }, [query, hitProgress]);
  const searchResults: RulesSearchPreview[] = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return buildSearchPreviews(filteredSections, query, 300);
  }, [filteredSections, query]);

  useEffect(() => {
    const progress = documentRef.current?.resetQueryHitCursor();
    setHitProgress(progress || {current: 0, total: 0});
  }, [query, filteredSections]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(draftQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [draftQuery]);

  const submitSearch = useCallback(() => {
    const trimmed = draftQuery.trim();
    setQuery(trimmed);
    Keyboard.dismiss();
  }, [draftQuery]);

  const onAnchorPress = (anchor: string) => {
    Keyboard.dismiss();
    documentRef.current?.scrollToAnchor(anchor);
    setShowToc(false);
    setSearchOpen(false);
  };
  const onSelectSearchResult = useCallback((result: RulesSearchPreview) => {
    Keyboard.dismiss();
    setSearchOpen(false);
    const progress = documentRef.current?.selectQueryPage(result.pageRef);
    if (progress) setHitProgress(progress);
    requestAnimationFrame(() => documentRef.current?.scrollToPage(result.pageRef));
  }, []);
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

  const clearQuery = () => {
    setDraftQuery('');
    setQuery('');
    setHitProgress({current: 0, total: 0});
  };
  const toggleCollapsed = (anchor: string) =>
    setCollapsedTocAnchors(current => {
      const next = new Set(current);
      if (next.has(anchor)) next.delete(anchor);
      else next.add(anchor);
      return next;
    });

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

  const browsing = split || searchOpen;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <View testID="rules-workspace" onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{flex: 1, flexDirection: 'row'}}>
        <View
          style={{
            position: split ? 'relative' : 'absolute',
            top: 0, bottom: 0, left: 0, zIndex: 2,
            backgroundColor: theme.backgroundColor,
            width: split ? browserWidth : '100%',
            display: browsing ? 'flex' : 'none',
            borderRightWidth: split ? 0.5 : 0,
            borderColor: theme.dividerColor,
          }}>
          <RulesBrowser
            theme={theme}
            draftQuery={draftQuery}
            query={query}
            onChange={setDraftQuery}
            onSubmit={submitSearch}
            onClear={clearQuery}
            results={searchResults}
            onResult={onSelectSearchResult}
            entries={rulesDocument.toc}
            onAnchor={onAnchorPress}
            collapsed={collapsedTocAnchors}
            onCollapse={toggleCollapsed}
            bottomInset={bottomInset}
            compact={!split}
            onClose={() => {
              Keyboard.dismiss();
              setSearchOpen(false);
            }}
          />
        </View>
        <View
          accessibilityElementsHidden={!split && searchOpen}
          importantForAccessibility={!split && searchOpen ? 'no-hide-descendants' : 'auto'}
          pointerEvents={!split && searchOpen ? 'none' : 'auto'}
          style={{
            flex: 1,
            minWidth: 0,
            opacity: !split && searchOpen ? 0 : 1,
            paddingBottom: bottomInset,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              minHeight: 48,
            }}>
            <PaneIconButton
              testID="rules-open-search"
              label={query ? 'Back to search results' : 'Search rules'}
              icon={query ? 'chevron-back' : 'search-outline'}
              onPress={() => setSearchOpen(true)}
            />
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: theme.foregroundColor,
                fontSize: 17,
                fontWeight: '600',
              }}>
              Rules
            </Text>
            <PaneIconButton
              testID="rules-toc-toggle"
              label="Table of contents"
              icon="list-outline"
              onPress={() => setShowToc(value => !value)}
            />
          </View>
          <RulesDocumentView
            ref={documentRef}
            preserveSourceFormatting={rulesDocument.extractionFormat === 'pdf-spans-v1'}
            sections={rulesDocument.sections}
            query={query}
            theme={theme}
            onVisiblePagesChange={handleVisiblePagesChange}
            bottomInset={16}
          />
          <Text
            testID="rules-visible-pages"
            style={{
              textAlign: 'center',
              padding: 8,
              fontSize: 13,
              color: theme.foregroundColor,
              opacity: 0.65,
            }}>
            {visiblePagesLabel}
          </Text>
          {!!query && (
            <RulesSearchFooter
              query={query}
              hitProgressLabel={hitProgressLabel}
              onOpenSearch={() => setSearchOpen(true)}
              onPrevHit={onPrevHit}
              onNextHit={onNextHit}
            />
          )}
          {showToc && (
            <RulesToc
              entries={rulesDocument.toc}
              onAnchorPress={onAnchorPress}
              theme={theme}
              collapsedAnchors={collapsedTocAnchors}
              onToggleCollapsed={toggleCollapsed}
              onClose={() => setShowToc(false)}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RulesScreen;
