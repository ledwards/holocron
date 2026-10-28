import React, {useState, useEffect} from 'react';
import {View, useColorScheme, Appearance, StatusBar, ColorSchemeName} from 'react-native';
import {NavigationContainer, DefaultTheme, Theme as NavigationTheme} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context';
import Card from './src/models/Card';
import ExpansionSet from './src/models/ExpansionSet';
import Decklist from './src/models/Decklist';

import TabNavigation from './src/components/navigation/TabNavigation';

import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import downloadExpansionSets from './src/lib/DownloadExpansionSets';
import downloadDecklists from './src/lib/DownloadDecklists';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';
import loadExpansionSets from './src/lib/LoadExpansionSets';
import loadDecklists from './src/lib/LoadDecklists';

import themeDark from './src/styles/themeDark';
import themeLight from './src/styles/themeLight';

import ThemeContext from './src/contexts/ThemeContext';
import AllCardsContext from './src/contexts/AllCardsContext';
import CardDataStatusContext, {CardDataStatus} from './src/contexts/CardDataStatusContext';
import AllDecklistsContext from './src/contexts/AllDecklistsContext';
import AllExpansionsContext from './src/contexts/AllExpansionsContext';
import { Theme } from './src/types/interfaces';

const App = () => {
  const initialTheme = useColorScheme();

  const [cardDataStatus, setCardDataStatus] = useState<CardDataStatus>('loading');
  const [isDecklistsDownloadReady, setIsDecklistsDownloadReady] =
    useState<boolean>(false);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [expansionSets, setExpansionSets] = useState<ExpansionSet[]>([]);
  const [allDecklists, setAllDecklists] = useState<Decklist[]>([]);
  const [internetConnection, setInternetConnection] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<Theme>(
    initialTheme === 'light' ? themeLight as Theme : themeDark as Theme,
  );

  useEffect(() => {
    setTheme(initialTheme === 'light' ? themeLight as Theme : themeDark as Theme);

    const appearanceSubscription = Appearance.addChangeListener(({colorScheme}: {colorScheme: ColorSchemeName}) => {
      setTheme(colorScheme === 'light' ? themeLight as Theme : themeDark as Theme);
    });

    NetInfo.fetch().then(state => {
      setInternetConnection(state.isConnected || false);
    }).catch(() => setInternetConnection(false));

    const unsubscribeNetwork = NetInfo.addEventListener(state => {
      setInternetConnection(state.isConnected || false);
    });
    return () => {
      appearanceSubscription?.remove();
      unsubscribeNetwork();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let availableCards = allCards;
    if (!availableCards.length) setCardDataStatus('loading');

    const readCards = async () => {
      const sets = await loadExpansionSets();
      const cards = await loadCardDefinitions(sets);
      if (active && cards.length) {
        availableCards = cards;
        setExpansionSets(sets);
        setAllCards(cards);
        setCardDataStatus('ready');
      }
    };
    const initializeCards = async () => {
      // Cached/bundled cards are usable immediately, even during a refresh.
      await readCards().catch(error => console.log(error));
      if (!active) return;
      if (internetConnection === true) {
        await Promise.allSettled([downloadCardDefinitions(), downloadExpansionSets()]);
        if (!active) return;
        await readCards().catch(error => console.log(error));
      }
      if (active && internetConnection !== null) {
        setCardDataStatus(availableCards.length ? 'ready' : 'unavailable');
      }
    };
    initializeCards();
    return () => { active = false; };
    // Connectivity changes start a new load; publishing cards must not restart it.
  }, [internetConnection]);

  useEffect(() => {
    if (!isDecklistsDownloadReady && internetConnection) {
      downloadDecklists()
        .catch(error => console.log(error))
        .then(() => setIsDecklistsDownloadReady(true));
    }
  }, [internetConnection]);

  useEffect(() => {
    let active = true;
    if (!internetConnection || isDecklistsDownloadReady) {
      loadDecklists().then(decklists => {
        if (active) setAllDecklists(decklists);
      }).catch(error => console.log(error));
    }
    return () => { active = false; };
  }, [internetConnection, isDecklistsDownloadReady]);

  const NavigationContainerTheme: NavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.backgroundColor,
    },
  };

  return (
    <AllDecklistsContext.Provider value={allDecklists}>
      <CardDataStatusContext.Provider value={cardDataStatus}>
      <AllCardsContext.Provider value={allCards}>
        <AllExpansionsContext.Provider value={expansionSets}>
          <ThemeContext.Provider value={theme}>
            <View style={{width: '100%', height: '100%'}}>
              <View
                style={{
                  flex: 1,
                }}>
                <StatusBar barStyle={theme.statusBarStyle as 'light-content' | 'dark-content' | 'default'} />
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <NavigationContainer theme={NavigationContainerTheme}>
                  <View
                    style={{
                      flex: 1,
                    }}>
                    <TabNavigation
                      allCards={allCards}
                      expansionSets={expansionSets}
                      allDecklists={allDecklists}
                    />
                  </View>
                </NavigationContainer>
                </SafeAreaProvider>
              </View>
            </View>
          </ThemeContext.Provider>
        </AllExpansionsContext.Provider>
      </AllCardsContext.Provider>
      </CardDataStatusContext.Provider>
    </AllDecklistsContext.Provider>
  );
};

export default App;
