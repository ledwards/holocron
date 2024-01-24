import {ScrollView, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Card from '../../models/Card';
import Decklist from '../../models/Decklist';

import layout from '../../constants/layout';
import styles from '../../styles/DecklistsScreenListViewStyles';

const DecklistsScreenListView = ({route}) => {
  const navigation = useNavigation();
  navigation.setOptions({
    title: route.params.decklist.displaySubtitle,
  });

  return (
    <ScrollView
      style={{
        ...styles.decklistView,
        backgroundColor: route.params.theme.backgroundColor,
      }}>
      <Text
        style={{
          ...styles.decklistViewTitle,
          color: route.params.theme.foregroundColor,
        }}>
        {route.params.decklist.displayTitle}
      </Text>
      <Text
        style={{
          ...styles.decklistViewSubtitle,
          color: route.params.theme.foregroundColor,
        }}>
        {route.params.decklist.displaySubtitle}
        {/* {route.params.decklist.url} */}
      </Text>
      <Text
        style={{
          ...styles.decklistViewBody,
          color: route.params.theme.foregroundColor,
        }}>
        {route.params.decklist.plaintext}
      </Text>
    </ScrollView>
  );
};
export default DecklistsScreenListView;
