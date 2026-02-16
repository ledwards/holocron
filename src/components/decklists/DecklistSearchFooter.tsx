import React, {useContext, useEffect, useState} from 'react';
import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {SearchBar, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import DecklistsQueryStatusBar from './DecklistsQueryStatusBar';
import styles from '../../styles/CardSearchFooterStyles';
import ThemeContext from '../../contexts/ThemeContext';
import Decklist from '../../models/Decklist';

interface DecklistSearchFooterProps {
  query: string;
  data: Decklist[];
  searchCallback: (text: string) => void;
}

const DecklistSearchFooter = (props: DecklistSearchFooterProps) => {
  const theme = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Decklist[]>([]);
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  const onChangeText = (text: string) => {
    setQuery(text);
    props.searchCallback(text);
  };

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
          blurType={theme?.name === 'dark' ? 'dark' : 'light'}
          blurAmount={18}
          reducedTransparencyFallbackColor={theme?.translucentBackgroundColor}
        />
        <View
          pointerEvents="box-none"
          style={{
            ...styles.glassDockContent,
            paddingBottom: bottomGlassPadding,
          }}>
          <View style={{...styles.statusRowSlot, minHeight: 34}}>
            {!query ? (
              <View style={styles.modeCoachTip}>
                <Text style={{color: theme?.foregroundColor}}>
                  {`Searching ${data.length} decklists`}
                </Text>
              </View>
            ) : (
              <DecklistsQueryStatusBar query={query} data={data} />
            )}
          </View>
          <SearchBar
            testID="decklists-search-input"
            placeholder="Search by tournament, player, or archetype"
            round
            onChangeText={onChangeText}
            autoCorrect={false}
            value={query}
            containerStyle={{
              ...styles.searchBarContainer,
              ...styles.searchBarTight,
            }}
            inputContainerStyle={{
              backgroundColor: theme?.secondaryBackgroundColor,
            }}
            searchIcon={{
              name: 'search',
              type: 'ionicon',
              color: theme?.iconColor,
            }}
            clearIcon={{
              name: 'close-outline',
              type: 'ionicon',
              color: theme?.iconColor,
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default DecklistSearchFooter;
