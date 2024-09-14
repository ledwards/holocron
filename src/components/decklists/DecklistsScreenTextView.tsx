import React, {useContext} from 'react';
import {ScrollView, Text} from 'react-native';

import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenTextViewStyles';
import ThemeContext from '../../contexts/ThemeContext';

const DecklistsScreenTextView = ({route}) => {
  const theme = useContext(ThemeContext);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          ...styles.decklistView,
          backgroundColor: theme.backgroundColor,
          paddingEnd: layout.nativeHeaderHeight(),
        }}>
        <Text
          style={{
            ...styles.decklistViewTitle,
            color: theme.foregroundColor,
          }}>
          {route.params.decklist.displayTitle}
        </Text>
        <Text
          style={{
            ...styles.decklistViewSubtitle,
            color: theme.foregroundColor,
          }}>
          {route.params.decklist.displaySubtitle}
          {/* {route.params.decklist.url} */}
        </Text>
        <Text
          style={{
            ...styles.decklistViewBody,
            color: theme.foregroundColor,
          }}>
          {route.params.decklist.plaintext}
        </Text>
      </ScrollView>
      <DecklistEmptyFooter
        nativeFooterHeight={layout.nativeFooterHeight()}
        tabBarHeight={layout.tabBarHeight()}
      />
      <DecklistEmptyFooter
        nativeFooterHeight={layout.nativeFooterHeight()}
        tabBarHeight={layout.tabBarHeight()}
      />
    </>
  );
};
export default React.memo(DecklistsScreenTextView);
