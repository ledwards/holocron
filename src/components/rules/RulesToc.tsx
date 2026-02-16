import React, {useMemo, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Theme} from '../../types/interfaces';
import {TocEntry} from '../../lib/rules/types';
import styles from '../../styles/RulesScreenStyles';
import {rulesFontFamilies} from '../../styles/rulesTypography';

interface RulesTocProps {
  entries: TocEntry[];
  onAnchorPress: (anchor: string) => void;
  theme: Theme;
  collapsedAnchors: Set<string>;
  onToggleCollapsed: (anchor: string) => void;
  onClose: () => void;
}

interface TocNode extends TocEntry {
  children: TocNode[];
}

function buildTocTree(entries: TocEntry[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  entries.forEach(entry => {
    const node: TocNode = {...entry, children: []};
    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (!stack.length) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  });

  return roots;
}

function filterTree(nodes: TocNode[], query: string): TocNode[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return nodes;
  }

  return nodes
    .map(node => ({
      ...node,
      children: filterTree(node.children, query),
    }))
    .filter(node => {
      return (
        node.title.toLowerCase().includes(trimmed) ||
        node.children.length > 0
      );
    });
}

const RulesToc = ({
  entries,
  onAnchorPress,
  theme,
  collapsedAnchors,
  onToggleCollapsed,
  onClose,
}: RulesTocProps) => {
  const [query, setQuery] = useState('');
  const tree = useMemo(() => buildTocTree(entries), [entries]);
  const filtered = useMemo(() => filterTree(tree, query), [tree, query]);

  const renderNode = (node: TocNode, depth: number): React.ReactNode => {
    const isCollapsed = collapsedAnchors.has(node.anchor);
    const hasChildren = node.children.length > 0;
    return (
      <View key={node.anchor}>
        <View style={styles.tocTreeRow}>
          {hasChildren ? (
            <TouchableOpacity
              testID={`rules-toc-expand-${node.anchor}`}
              onPress={() => onToggleCollapsed(node.anchor)}
              style={styles.tocExpandButton}>
              <Text
                style={{
                  color: theme.foregroundColor,
                  fontWeight: '700',
                  fontFamily: rulesFontFamilies.bold,
                }}>
                {isCollapsed ? '+' : '-'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.tocExpandSpacer} />
          )}
          <TouchableOpacity
            testID={`rules-toc-item-${node.order}`}
            onPress={() => onAnchorPress(node.anchor)}
            style={{
              ...styles.tocItem,
              paddingLeft: 8 + Math.max(0, depth) * 10,
            }}>
            <Text style={{...styles.tocText, color: theme.foregroundColor}}>
              {node.title}
            </Text>
          </TouchableOpacity>
        </View>
        {hasChildren && !isCollapsed
          ? node.children.map(child => renderNode(child, depth + 1))
          : null}
      </View>
    );
  };

  return (
    <View testID="rules-toc-panel" style={styles.tocDrawerOverlay}>
      <TouchableOpacity
        testID="rules-toc-backdrop"
        style={styles.tocDrawerBackdrop}
        onPress={onClose}
      />
      <View
        style={{
          ...styles.tocDrawer,
          borderColor: theme.dividerColor,
          backgroundColor: theme.backgroundColor,
        }}>
        <TextInput
          testID="rules-toc-search-input"
          value={query}
          onChangeText={setQuery}
          placeholder="Filter TOC"
          placeholderTextColor={theme.dividerColor}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            ...styles.tocSearchInput,
            borderColor: theme.dividerColor,
            color: theme.foregroundColor,
            backgroundColor: theme.translucentBackgroundColor,
            fontFamily: rulesFontFamilies.regular,
          }}
        />
        <ScrollView style={styles.tocTreeScroll}>
          {filtered.map(node => renderNode(node, 0))}
        </ScrollView>
      </View>
    </View>
  );
};

export default RulesToc;
