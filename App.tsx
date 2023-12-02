import React, {useState, useEffect} from 'react';
import {Text, View, useColorScheme, Appearance} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import TabNavigation from './src/components/navigation/TabNavigation';

import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import downloadExpansionSets from './src/lib/DownloadExpansionSets';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';
import loadExpansionSets from './src/lib/LoadExpansionSets';

import themeDark from './src/styles/themeDark';
import themeLight from './src/styles/themeLight';

const App = () => {
  const initialTheme = useColorScheme();

  const [isCardDownloadReady, setIsCardDownloadReady] = useState(false);
  const [isSetsDownloadReady, setIsSetsDownloadReady] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [expansionSets, setExpansionSets] = useState([]);
  const [internetConnection, setInternetConnection] = useState(false);
  const [theme, setTheme] = useState(
    initialTheme.colorScheme === 'light' ? themeLight : themeDark,
  );

  useEffect(() => {
    setTheme(initialTheme.colorScheme === 'light' ? themeLight : themeDark);

    Appearance.addChangeListener(t => {
      setTheme(t.colorScheme === 'light' ? themeLight : themeDark);
    });

    NetInfo.fetch().then(state => {
      setInternetConnection(state.isConnected);
    });

    NetInfo.addEventListener(state => {
      setInternetConnection(state.isConnected);
    });
  }, []);

  useEffect(() => {
    if (!isCardDownloadReady && internetConnection) {
      downloadCardDefinitions().then(() => {
        setIsCardDownloadReady(true);
      });
    }

    if (!isSetsDownloadReady && internetConnection) {
      downloadExpansionSets().then(() => {
        setIsSetsDownloadReady(true);
      });
    }
  }, [internetConnection]);

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
    <View style={{width: '100%', height: '100%', backgroundColor: 'purple'}}>
      <NavigationContainer>
        <TabNavigation
          allCards={allCards}
          expansionSets={expansionSets}
          theme={theme}
        />
      </NavigationContainer>
    </View>
  );
};

export default App;
