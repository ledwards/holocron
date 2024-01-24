import {View, Text} from 'react-native';
import SearchBarChip from '../cards/SearchBarChip';

import Decklist from '../../models/Decklist';

import styles from '../../styles/QueryStatusBarStyles';

type DecklistsQueryStatusBarProps = {
  theme: any;
  query: string;
  allDecklists: Decklist[];
  data: Decklist[];
};

const DecklistsQueryStatusBar = (props: DecklistsQueryStatusBarProps) => (
  <>
    <View style={styles.filterQueryContainer}>
      {props.query != '' && (
        <SearchBarChip
          title={props.query}
          colorConditional={true}
          theme={props.theme}
        />
      )}

      <Text
        style={{
          color: props.theme.foregroundColor,
          ...styles.resultsCount,
        }}></Text>
    </View>
  </>
);

export default DecklistsQueryStatusBar;
