import React, {useContext, useMemo} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import ThemeContext from '../../contexts/ThemeContext';
import {Theme} from '../../types/interfaces';
import styles from '../../styles/CardSearchFooterStyles';
import {rulesFontFamilies} from '../../styles/rulesTypography';

interface RulesSearchFooterProps {
  draftQuery: string;
  query: string;
  onDraftQueryChange: (value: string) => void;
  onSubmitQuery: () => void;
  onClearQuery: () => void;
  isSearching: boolean;
  showToc: boolean;
  onToggleToc: () => void;
  filteredCount: number;
  totalCount: number;
  hitCount: number;
  hitProgressLabel?: string;
  onPrevHit: () => void;
  onNextHit: () => void;
  visiblePagesLabel?: string;
}

const fallbackTheme: Theme = {
  name: 'dark',
  backgroundColor: '#000000',
  foregroundColor: '#FFFFFF',
  dividerColor: '#444444',
  translucentBackgroundColor: 'rgba(0,0,0,0.5)',
};

const RulesSearchFooter = ({
  draftQuery,
  query,
  onDraftQueryChange,
  onSubmitQuery,
  onClearQuery,
  isSearching,
  showToc,
  onToggleToc,
  filteredCount,
  totalCount,
  hitCount,
  hitProgressLabel,
  onPrevHit,
  onNextHit,
  visiblePagesLabel,
}: RulesSearchFooterProps) => {
  const theme = useContext<Theme | null>(ThemeContext) || fallbackTheme;
  const tabBarHeight = useBottomTabBarHeight();

  const statusText = useMemo(() => {
    if (isSearching) {
      return 'Searching rules...';
    }
    if (!query.trim()) {
      return `Showing ${totalCount} sections`;
    }
    return `Showing ${filteredCount} of ${totalCount} sections • ${hitCount} hit${
      hitCount === 1 ? '' : 's'
    }`;
  }, [isSearching, query, filteredCount, totalCount, hitCount]);

  const bottomGlassPadding = Math.max(tabBarHeight, 58) + 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      keyboardVerticalOffset={0}
      style={styles.overlayWrapper}
      pointerEvents="box-none">
      <View
        pointerEvents="box-none"
        style={{
          ...styles.glassDockContainer,
          bottom: 0,
          borderTopColor: theme.dividerColor,
        }}>
        <BlurView
          style={styles.glassDockBlur}
          blurType={theme.name === 'dark' ? 'dark' : 'light'}
          blurAmount={18}
          reducedTransparencyFallbackColor={theme.translucentBackgroundColor}
        />
        <View
          pointerEvents="box-none"
          style={{
            ...styles.glassDockContent,
            paddingBottom: bottomGlassPadding,
          }}>
          <View style={styles.statusRowSlot}>
            <Text
              style={{
                color: theme.foregroundColor,
                fontSize: 13,
                fontWeight: '600',
                fontFamily: rulesFontFamilies.bold,
              }}>
              {statusText}
            </Text>
          </View>
          <View style={{alignItems: 'center', paddingBottom: 8}}>
            <Text
              testID="rules-visible-pages"
              style={{
                color: theme.foregroundColor,
                fontSize: 13,
                fontWeight: '700',
                fontFamily: rulesFontFamilies.bold,
              }}>
              {visiblePagesLabel || 'Page -'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingBottom: 8,
            }}>
            {query.trim().length > 0 && (
              <>
                <TouchableOpacity
                  testID="rules-prev-hit"
                  onPress={onPrevHit}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.dividerColor,
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    backgroundColor: theme.translucentBackgroundColor,
                  }}>
                  <Text
                    style={{
                      color: theme.foregroundColor,
                      fontWeight: '700',
                      fontFamily: rulesFontFamilies.bold,
                    }}>
                    Prev
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="rules-next-hit"
                  onPress={onNextHit}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.dividerColor,
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    backgroundColor: theme.translucentBackgroundColor,
                  }}>
                  <Text
                    style={{
                      color: theme.foregroundColor,
                      fontWeight: '700',
                      fontFamily: rulesFontFamilies.bold,
                    }}>
                    Next
                  </Text>
                </TouchableOpacity>
                {hitProgressLabel ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.dividerColor,
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      backgroundColor: theme.translucentBackgroundColor,
                    }}>
                    <Text
                      testID="rules-hit-progress"
                      style={{
                        color: theme.foregroundColor,
                        fontWeight: '700',
                        fontFamily: rulesFontFamilies.bold,
                      }}>
                      {hitProgressLabel}
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingBottom: 2,
            }}>
            <TouchableOpacity
              testID="rules-toc-toggle"
              onPress={onToggleToc}
              style={{
                borderWidth: 1,
                borderColor: theme.dividerColor,
                borderRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: theme.translucentBackgroundColor,
              }}>
              <Text
                style={{
                  color: theme.foregroundColor,
                  fontWeight: '700',
                  fontFamily: rulesFontFamilies.bold,
                }}>
                {showToc ? 'TOC On' : 'TOC'}
              </Text>
            </TouchableOpacity>
            <TextInput
              testID="rules-search-input"
              value={draftQuery}
              onChangeText={onDraftQueryChange}
              onSubmitEditing={onSubmitQuery}
              placeholder="Search rules"
              placeholderTextColor={theme.dividerColor}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.dividerColor,
                borderRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 12,
                color: theme.foregroundColor,
                backgroundColor: theme.translucentBackgroundColor,
                fontSize: 16,
                fontFamily: rulesFontFamilies.regular,
              }}
            />
            <TouchableOpacity
              testID="rules-submit-search"
              onPress={onSubmitQuery}
              disabled={isSearching}
              style={{
                borderWidth: 1,
                borderColor: theme.dividerColor,
                borderRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: theme.translucentBackgroundColor,
                opacity: isSearching ? 0.6 : 1,
              }}>
              <Text
                style={{
                  color: theme.foregroundColor,
                  fontWeight: '700',
                  fontFamily: rulesFontFamilies.bold,
                }}>
                {isSearching ? 'Searching' : 'Search'}
              </Text>
            </TouchableOpacity>
            {draftQuery.trim().length > 0 && (
              <TouchableOpacity
                testID="rules-clear-search"
                onPress={() => {
                  onClearQuery();
                }}
                style={{
                  borderWidth: 1,
                  borderColor: theme.dividerColor,
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  backgroundColor: theme.translucentBackgroundColor,
                }}>
                <Text
                  style={{
                    color: theme.foregroundColor,
                    fontWeight: '700',
                    fontFamily: rulesFontFamilies.bold,
                  }}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RulesSearchFooter;
