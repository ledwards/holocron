import React, {useContext} from 'react';
import {ScrollView, Text} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import useBottomClearance from '../../lib/useBottomClearance';
import {usePaneInsets} from '../../contexts/PaneInsetsContext';


import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenTextViewStyles';
import ThemeContext from '../../contexts/ThemeContext';

const DecklistsScreenTextView = ({route, embedded = false}) => {
  const theme = useContext(ThemeContext);
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomClearance();
  // Scrolls under the translucent header; text stays clear of the strip.
  const insets = usePaneInsets();

  return (
    <>
      <ScrollView
        testID="deck-text"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          ...styles.decklistView,
          backgroundColor: theme.backgroundColor,
          paddingTop: (embedded ? insets.top : headerHeight) + 24,
          paddingBottom: tabBarHeight + 24,
          paddingLeft: styles.decklistView.padding + insets.left,
          paddingRight: styles.decklistView.padding + insets.right,
        }}
        scrollIndicatorInsets={{top: embedded ? insets.top : headerHeight}}>
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
    </>
  );
};
export default React.memo(DecklistsScreenTextView);
