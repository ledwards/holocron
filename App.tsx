/**
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';
import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';

const App = () => {
  const [isCardDownloadReady, setIsCardDownloadReady] = useState(false);
  const [allCards, setAllCards] = useState([]);

  useEffect(() => {
    downloadCardDefinitions().then(() => {
      setIsCardDownloadReady(true);
    });
  }, []);

  useEffect(() => {
    loadCardDefinitions().then(cards => {
      setAllCards(cards);
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
