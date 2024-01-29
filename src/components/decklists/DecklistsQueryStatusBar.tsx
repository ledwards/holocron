import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import SearchBarChip from '../cards/SearchBarChip';

import Decklist from '../../models/Decklist';

import styles from '../../styles/QueryStatusBarStyles';
import ThemeContext from '../../contexts/ThemeContext';

type DecklistsQueryStatusBarProps = {
  query: string;
  data: Decklist[];
};

const DecklistsQueryStatusBar = (props: DecklistsQueryStatusBarProps) => {
  const theme = useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, []);

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  return (
    <>
      <View style={styles.filterQueryContainer}>
        {query != '' && <SearchBarChip title={query} colorConditional={true} />}

        <Text
          style={{
            color: theme.foregroundColor,
            ...styles.resultsCount,
          }}>
          {query ? `(${data.length} results)` : ''}
        </Text>
      </View>
    </>
  );
};

export default DecklistsQueryStatusBar;
