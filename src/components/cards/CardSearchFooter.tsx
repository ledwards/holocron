import React, {useContext, useMemo, useState, useEffect} from 'react';
import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {Icon, Text, SearchBar as RNESearchBar} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import QueryStatusBar from './QueryStatusBar';
import FilterQuerySet from '../../models/FilterQuerySet';
import Card from '../../models/Card';
import styles from '../../styles/CardSearchFooterStyles';
import ThemeContext from '../../contexts/ThemeContext';
import {SearchMode} from '../../types/interfaces';

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
  theme,
  searchMode,
}: {
  theme: any;
  searchMode: SearchMode;
}) => (
  <View style={styles.modeCoachTip}>
    <Text style={{color: theme.foregroundColor}}>Tap the</Text>
    <Icon
      name={searchMode.icon}
      type="ionicon"
      color={theme.foregroundColor}
      size={16}
      style={styles.defaultTextIcon}
    />
    <Text style={{color: theme.foregroundColor}}>
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

  const tabBarHeight = useBottomTabBarHeight();
  const [localQuery, setLocalQuery] = useState(props.query);

  useEffect(() => {
    // Keep controlled resets (clear/toggle mode) in sync without fighting rapid typing.
    if (props.query === '' && localQuery !== '') {
      setLocalQuery('');
    }
  }, [props.query, localQuery]);

  const queryHeight = useMemo(() => {
    const count = props.filterQuerySet.length();
    return props.query ? 18 + 30 * count + (count > 1 ? 28 : 0) : 34;
  }, [props.filterQuerySet, props.query]);
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
          <RNESearchBar
            platform="default"
            testID="cards-search-input"
            placeholder={`Search by ${props.searchMode.label}`}
            value={localQuery}
            onChangeText={text => {
              setLocalQuery(text);
              props.searchCallback(text);
            }}
            onClear={() => {
              setLocalQuery('');
              props.searchCallback('');
            }}
            autoCorrect={false}
            round={true}
            containerStyle={{
              ...styles.searchBarContainer,
              ...styles.searchBarTight,
            }}
            inputContainerStyle={{
              backgroundColor: theme.secondaryBackgroundColor,
            }}
            searchIcon={{
              name: props.searchMode.icon,
              type: 'ionicon',
              color: theme.iconColor || theme.foregroundColor,
              testID: 'cards-search-mode-toggle',
              accessibilityLabel: 'cards-search-mode-toggle',
              onPress: props.toggleSearchMode,
            }}
            clearIcon={{
              name: 'close-outline',
              type: 'ionicon',
              color: theme.iconColor || theme.foregroundColor,
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CardSearchFooter;
