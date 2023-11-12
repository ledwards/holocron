/**
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';
// TODO: Test what happens when downloading files but offline
import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import downloadExpansionSets from './src/lib/DownloadExpansionSets';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';
import loadExpansionSets from './src/lib/LoadExpansionSets';
import ExpansionSet from './src/models/ExpansionSet';

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
    if (isCardDownloadReady && isSetsDownloadReady) {
      loadExpansionSets()
        .then(sets => {
          setExpansionSets(sets);
          return sets;
        })
        .then(expansionSets => {
          loadCardDefinitions(expansionSets).then(cards => {
            setAllCards(cards);
          });
        });
    }
  }, [isCardDownloadReady, isSetsDownloadReady]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {allCards && allCards.length > 0 ? (
        <SearchableCardList cards={allCards} />
      ) : (
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

export default App;
