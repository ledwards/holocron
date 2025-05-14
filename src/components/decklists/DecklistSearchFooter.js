import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {SearchBar, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import Decklist from '../../models/Decklist';
import DecklistsQueryStatusBar from './DecklistsQueryStatusBar';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

const DecklistSearchFooter = (props) => {
  const theme = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, []);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  const onChangeText = (text) => {
    setQuery(text);
    props.searchCallback(text);
  };

  return (
    <BottomTabBarHeightContext.Consumer>
      {tabBarHeight => (
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={layout.keyboardVerticalOffset()}>
          <View
            style={{
              ...styles.footerContainer,
              height: layout.footerHeight(tabBarHeight || 0, undefined),
            }}>
            <BlurView
              style={{
                position: 'absolute',
                bottom: 0,
                height: layout.footerHeight(tabBarHeight || 0, undefined),
                width: '100%',
              }}
              blurType={theme?.name === 'dark' ? 'dark' : 'light'}
              blurAmount={10}
              reducedTransparencyFallbackColor={
                theme?.translucentBackgroundColor
              }
            />
            <SearchBar
              ref={inputRef}
              placeholder="Search by tournament, player, or archetype"
              round
              onChangeText={onChangeText}
              autoCorrect={false}
              value={query}
              containerStyle={{
                ...styles.searchBarContainer,
                position: 'absolute',
                bottom: layout.searchBottomPosition(tabBarHeight || 0),
                height: layout.searchBarHeight(),
              }}
              inputContainerStyle={{
                backgroundColor: theme?.secondaryBackgroundColor,
              }}
              searchIcon={{
                name: 'search',
                type: 'ionicon',
                color: theme?.iconColor
              }}
            />

            <View
              style={{
                bottom: layout.statusBarBottomPosition(tabBarHeight || 0),
                ...styles.filterQuerySetContainer,
              }}>
              {!props.query ? (
                coachTipComponent(theme, data)
              ) : (
                <DecklistsQueryStatusBar query={query} data={data} />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </BottomTabBarHeightContext.Consumer>
  );
};

const coachTipComponent = (theme, decklists) => (
  <View style={styles.modeCoachTip}>
    <Text
      style={{
        color: theme?.foregroundColor,
      }}>
      {`Searching ${decklists.length} decklists`}
    </Text>
  </View>
);

export default DecklistSearchFooter;