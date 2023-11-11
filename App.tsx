/**
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';
import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import downloadExpansionSets from './src/lib/DownloadExpansionSets';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';
import loadExpansionSets from './src/lib/LoadExpansionSets';

const App = () => {
  const [isCardDownloadReady, setIsCardDownloadReady] = useState(false);
  const [isSetsDownloadReady, setIsSetsDownloadReady] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [expansionSets, setExpansionSets] = useState([]);

  useEffect(() => {
    downloadCardDefinitions().then(() => {
      setIsCardDownloadReady(true);
    });
    downloadExpansionSets().then(() => {
      setIsSetsDownloadReady(true);
    });
  }, []);

  useEffect(() => {
    loadCardDefinitions().then(cards => {
      setAllCards(cards);
    });
    loadExpansionSets().then(sets => {
      setExpansionSets(sets);
    });
  }, [isCardDownloadReady]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {allCards && allCards.length > 0 ? (
        <SearchableCardList cards={allCards} />
      ) : (
        <Text>{isCardDownloadReady ? 'true' : 'false'}</Text>
      )}
    </SafeAreaView>
  );
};

export default App;
