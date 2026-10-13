import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Keyboard,
  Pressable,
} from 'react-native';
import {Theme} from '../../types/interfaces';
import {RulesSearchPreview} from '../../lib/rules/search';
import {TocEntry} from '../../lib/rules/types';
import {Icon} from 'react-native-elements';
import RulesToc from './RulesToc';
import {PaneIconButton} from '../adaptive/AdaptiveWorkspace';

interface Props {
  compact?: boolean;
  onClose?: () => void;
  theme: Theme;
  draftQuery: string;
  query: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  results: RulesSearchPreview[];
  onResult: (result: RulesSearchPreview) => void;
  entries: TocEntry[];
  onAnchor: (anchor: string) => void;
  collapsed: Set<string>;
  onCollapse: (anchor: string) => void;
  bottomInset: number;
}
export default function RulesBrowser(props: Props) {
  const {theme} = props;
  const prefix = props.compact ? 'rules' : 'rules-wide';
  const highlight = (text: string) => {
    const query = props.query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let offset = 0;
    let match = query ? text.toLowerCase().indexOf(query) : -1;
    while (match >= 0) {
      parts.push(text.slice(offset, match));
      parts.push(
        <Text
          key={match}
          style={{backgroundColor: '#ffe661', color: '#1a1a1a'}}>
          {text.slice(match, match + query.length)}
        </Text>,
      );
      offset = match + query.length;
      match = text.toLowerCase().indexOf(query, offset);
    }
    parts.push(text.slice(offset));
    return parts;
  };
  return (
    <View testID="rules-browser" style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          paddingHorizontal: 8,
        }}>
        {props.compact ? (
          <PaneIconButton
            testID="rules-close-search"
            label="Back to rules"
            icon="chevron-back"
            onPress={() => props.onClose?.()}
          />
        ) : (
          <View style={{width: 44}} />
        )}
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '600',
            color: theme.foregroundColor,
          }}>
          Rules
        </Text>
        <View style={{width: 44}} />
      </View>
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor:
            theme.secondaryBackgroundColor ||
            (theme.name === 'dark' ? '#242424' : '#eeeeef'),
        }}>
        <View style={{width: 40}}>
          <Icon
            name="search-outline"
            type="ionicon"
            size={22}
            color={theme.foregroundColor}
          />
        </View>
        <TextInput
          testID={`${prefix}-search-input`}
          accessibilityLabel="Search rules"
          placeholder="Search rules"
          value={props.draftQuery}
          onChangeText={props.onChange}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            props.onSubmit();
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={theme.name === 'dark' ? '#aaaaaa' : '#666666'}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            paddingVertical: 10,
            fontSize: 17,
            color: theme.foregroundColor,
          }}
        />
        {!!props.draftQuery && (
          <PaneIconButton
            testID={`${prefix}-clear`}
            label="Clear search"
            icon="close-circle"
            onPress={props.onClear}
          />
        )}
      </View>
      {props.query ? (
        <>
          <Text
            style={{
              paddingHorizontal: 16,
              paddingBottom: 8,
              fontSize: 13,
              color: theme.foregroundColor,
              opacity: 0.65,
            }}>
            {props.results.length}{props.results.length === 300 ? '+' : ''} matches
          </Text>
          <FlatList
            testID={
              props.compact ? 'rules-search-results-list' : 'rules-wide-results'
            }
            data={props.results}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{paddingBottom: props.bottomInset}}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={{padding: 16, color: theme.foregroundColor}}>
                No matching rules found.
              </Text>
            }
            renderItem={({item, index}) => (
              <Pressable
                testID={
                  props.compact
                    ? `rules-search-result-${index}`
                    : `rules-wide-result-${index}`
                }
                accessibilityRole="button"
                accessibilityLabel={`Page ${item.pageRef}. ${item.sectionTitle}. ${item.snippet}`}
                onPress={() => props.onResult(item)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderTopWidth: 0.5,
                  borderColor: theme.dividerColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.foregroundColor,
                      opacity: 0.65,
                      marginBottom: 4,
                    }}>
                    Page {item.pageRef}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.foregroundColor,
                      marginBottom: 4,
                    }}>
                    {item.sectionTitle}
                  </Text>
                  <Text
                    numberOfLines={3}
                    style={{
                      fontSize: 16,
                      lineHeight: 23,
                      color: theme.foregroundColor,
                    }}>
                    {highlight(item.snippet)}
                  </Text>
                </View>
                <View style={{marginLeft: 12}}>
                  <Icon
                    name="chevron-forward"
                    type="ionicon"
                    size={18}
                    color={theme.foregroundColor}
                  />
                </View>
              </Pressable>
            )}
          />
        </>
      ) : (
        <View style={{flex: 1, paddingBottom: props.bottomInset}}>
          <RulesToc
            embedded
            entries={props.entries}
            theme={theme}
            onAnchorPress={props.onAnchor}
            collapsedAnchors={props.collapsed}
            onToggleCollapsed={props.onCollapse}
            onClose={() => undefined}
          />
        </View>
      )}
    </View>
  );
}
