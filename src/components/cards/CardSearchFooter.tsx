import React, {useContext, useMemo} from 'react';
import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {Icon, Text} from 'react-native-elements';
import SearchField from '../adaptive/SearchField';
import {BlurView} from '@react-native-community/blur';
import {useHeaderHeight} from '@react-navigation/elements';
import useSearchDockBottomPadding from '../../lib/useSearchDockBottomPadding';

import QueryStatusBar from './QueryStatusBar';
import FilterQuerySet from '../../models/FilterQuerySet';
import Card from '../../models/Card';
import styles from '../../styles/CardSearchFooterStyles';
import ThemeContext from '../../contexts/ThemeContext';
import {SearchMode, Theme} from '../../types/interfaces';

interface CardSearchFooterProps {
  query: string;
  filterQuerySet: FilterQuerySet;
  searchMode: SearchMode;
  allCards: Card[];
  data: Card[];
  searchCallback: (text: string) => void;
  toggleSearchMode: () => void;
}

const ModeCoachTipComponent = ({
  theme, searchMode,
}: {
  theme: Theme;
  searchMode: SearchMode;
}) => (
  <View style={styles.modeCoachTip}>
    <Text style={{color: theme.foregroundColor}}>Tap the</Text>
    <Icon name={searchMode.icon} type="ionicon" color={theme.foregroundColor}
      size={16} style={styles.defaultTextIcon} />
    <Text style={{color: theme.foregroundColor, flexShrink: 1}}>
      icon to switch between search modes.
    </Text>
  </View>
);

const CardSearchFooter = (props: CardSearchFooterProps) => {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    secondaryBackgroundColor: '#333333',
    iconColor: '#CCCCCC',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)',
  };

  const bottomGlassPadding = useSearchDockBottomPadding();
  const headerHeight = useHeaderHeight();
  const queryHeight = useMemo(() => {
    const count = props.filterQuerySet.length();
    return props.query ? 18 + 30 * count + (count > 1 ? 28 : 0) : 34;
  }, [props.filterQuerySet, props.query]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      keyboardVerticalOffset={headerHeight - bottomGlassPadding + 8}
      style={styles.overlayWrapper}
      pointerEvents="box-none">
      <View
        pointerEvents="box-none"
        style={{
          ...styles.glassDockContainer,
          bottom: 0,
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
          <View style={{...styles.statusRowSlot, minHeight: queryHeight}}>
            {!props.query ? (
              <ModeCoachTipComponent theme={theme} searchMode={props.searchMode} />
            ) : (
              <QueryStatusBar
                query={props.query}
                filterQuerySet={props.filterQuerySet}
                searchMode={props.searchMode}
                data={props.data}
              />
            )}
          </View>
          <SearchField
            testID="cards-search-input"
            placeholder={`Search by ${props.searchMode.label}`}
            value={props.query}
            onChangeText={props.searchCallback}
            icon={props.searchMode.icon}
            onModePress={props.toggleSearchMode}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CardSearchFooter;
