import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {SearchBar, Icon, Text} from 'react-native-elements';
import {BlurView} from '@react-native-community/blur';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';

import Decklist from '../../models/Decklist';
import DecklistsQueryStatusBar from './DecklistsQueryStatusBar';

import styles from '../../styles/CardSearchFooterStyles'; // TODO: Rename to DecklistSearchFooterStyles
import layout from '../../constants/layout';
import ThemeContext from '../../contexts/ThemeContext';

type DecklistSearchFooterProps = {
  query: string;
  nativeFooterHeight: number;
  searchBarHeight: number;
  allDecklists: Decklist[];
  data: Decklist[];
  searchCallback: (query: string) => void;
};

const DecklistSearchFooter = (props: DecklistSearchFooterProps) => {
  const theme = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [allDecklists, setAllDecklists] = useState(props.allDecklists);
  const [data, setData] = useState();

  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, []);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  const onChangeText = (text: string) => {
    setQuery(text);
    props.searchCallback(text);
    // setData(props.data);
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
              height: layout.footerHeight(tabBarHeight),
            }}>
            <BlurView
              style={{
                position: 'absolute',
                bottom: 0,
                height: layout.footerHeight(tabBarHeight),
                width: '100%',
              }}
              blurType={theme.name}
              blurAmount={10}
              reducedTransparencyFallbackColor={
                theme.translucentBackgroundColor
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
                bottom: layout.searchBottomPosition(tabBarHeight),
                height: layout.searchBarHeight(),
              }}
              inputContainerStyle={{
                backgroundColor: theme.secondaryBackgroundColor,
              }}
              searchIcon={
                <Icon name="search" type="ionicon" color={theme.iconColor} />
              }
            />

            <View
              style={{
                bottom: layout.statusBarBottomPosition(tabBarHeight),
                ...styles.filterQuerySetContainer,
              }}>
              {!props.query ? (
                coachTipComponent(theme, allDecklists)
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

const coachTipComponent = (theme: any, allDecklists) => (
  <View style={styles.modeCoachTip}>
    <Text
      style={{
        color: theme.foregroundColor,
      }}>
      {`Searching ${allDecklists.length} decklists`}
    </Text>
  </View>
);

export default DecklistSearchFooter;
