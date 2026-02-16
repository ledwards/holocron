import React from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Theme} from '../../types/interfaces';
import styles from '../../styles/RulesScreenStyles';

interface RulesSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  showToc: boolean;
  onToggleToc: () => void;
  onClearQuery: () => void;
  theme: Theme;
}

const RulesSearchBar = ({
  query,
  onQueryChange,
  showToc,
  onToggleToc,
  onClearQuery,
  theme,
}: RulesSearchBarProps) => (
  <View style={styles.searchRow}>
    <TextInput
      testID="rules-search-input"
      value={query}
      onChangeText={onQueryChange}
      placeholder="Search rules"
      placeholderTextColor={theme.dividerColor}
      autoCapitalize="none"
      autoCorrect={false}
      style={{
        ...styles.searchInput,
        color: theme.foregroundColor,
        backgroundColor: theme.backgroundColor,
        borderColor: theme.dividerColor,
      }}
    />
    <TouchableOpacity
      testID="rules-toc-toggle"
      onPress={onToggleToc}
      style={{
        ...styles.tocButton,
        marginLeft: 8,
        borderColor: theme.dividerColor,
        backgroundColor: theme.translucentBackgroundColor,
      }}>
      <Text style={{...styles.tocButtonText, color: theme.foregroundColor}}>
        {showToc ? 'Hide TOC' : 'TOC'}
      </Text>
    </TouchableOpacity>
    {query.trim().length > 0 && (
      <TouchableOpacity
        testID="rules-clear-search"
        onPress={onClearQuery}
        style={{
          ...styles.clearButton,
          borderColor: theme.dividerColor,
          backgroundColor: theme.translucentBackgroundColor,
        }}>
        <Text style={{...styles.clearButtonText, color: theme.foregroundColor}}>
          Clear
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default RulesSearchBar;
