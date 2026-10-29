import React, {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-elements';
import SearchField from '../adaptive/SearchField';
import SearchDock from '../glass/SearchDock';

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

  useEffect(() => {
    setQuery(props.query);
    setData(props.data);
  }, [props.query, props.data]);

  const onChangeText = (text = '') => {
    setQuery(text);
    props.searchCallback(text);
  };


  return (
    <SearchDock>
      {focus => (
        <>
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
          <SearchField
            testID="decklists-search-input"
            placeholder="Search by tournament, player, or archetype"
            onChangeText={onChangeText}
            value={query}
            onFocus={focus.onFocus}
            onBlur={focus.onBlur}
          />
        </>
      )}
    </SearchDock>
  );
};

export default DecklistSearchFooter;
