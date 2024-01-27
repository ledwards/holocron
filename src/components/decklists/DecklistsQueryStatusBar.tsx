import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import SearchBarChip from '../cards/SearchBarChip';

import Decklist from '../../models/Decklist';

import styles from '../../styles/QueryStatusBarStyles';
import ThemeContext from '../../contexts/ThemeContext';

type DecklistsQueryStatusBarProps = {
  query: string;
  allDecklists: Decklist[];
  data: Decklist[];
};

const DecklistsQueryStatusBar = (props: DecklistsQueryStatusBarProps) => {
  const theme = useContext(ThemeContext);

  return (
    <>
      <View style={styles.filterQueryContainer}>
        {props.query != '' && (
          <SearchBarChip title={props.query} colorConditional={true} />
        )}

        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.resultsCount,
          }}>
          {props.query ? `(${props.data.length} results)` : ''}
        </Text>
      </View>
    </>
  );
};

export default DecklistsQueryStatusBar;
