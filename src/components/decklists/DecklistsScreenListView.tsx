import {useContext} from 'react';
import {ScrollView, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Card from '../../models/Card';
import Decklist from '../../models/Decklist';
import DecklistEmptyFooter from './DecklistEmptyFooter';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenListViewStyles';
import ThemeContext from '../../contexts/ThemeContext';

const DecklistsScreenListView = ({route}) => {
  const navigation = useNavigation();
  navigation.setOptions({
    title: route.params.decklist.displaySubtitle,
  });

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
export default DecklistsScreenListView;
