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
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [isCardDownloadReady, isSetsDownloadReady]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {allCards && allCards.length > 0 ? (
        <SearchableCardList cards={allCards} />
      ) : (
        <Text style={{textAlign: 'center'}}>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

export default App;
