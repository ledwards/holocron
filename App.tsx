import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  useColorScheme,
  StatusBar,
  Platform,
  Appearance,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';

import SearchableCardList from './src/components/SearchableCardList';

import downloadCardDefinitions from './src/lib/DownloadCardDefinitions';
import downloadExpansionSets from './src/lib/DownloadExpansionSets';
import loadCardDefinitions from './src/lib/LoadCardDefinitions';
import loadExpansionSets from './src/lib/LoadExpansionSets';

import themeDark from './src/styles/themeDark';
import themeLight from './src/styles/themeLight';

const statusBarHeight = () =>
  Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const headerHeight = () => {
  if (Platform.OS === 'android') {
    return 0;
  } else if (DeviceInfo.hasNotch()) {
    return 44;
  } else {
    return 0;
  }
};

const nativeHeaderHeight = () => statusBarHeight() + headerHeight();
const nativeFooterHeight = () => {
  if (Platform.OS === 'android') {
    return 0;
  } else if (DeviceInfo.hasNotch()) {
    return 44;
  } else {
    return 30;
  }
};

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
    <View
      style={{
        flex: 1,
      }}>
      <StatusBar barStyle={theme.statusBarStyle} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.backgroundColor,
        }}>
        {allCards && allCards.length > 0 ? (
          <>
            <SearchableCardList
              cards={allCards}
              theme={theme}
              nativeHeaderHeight={nativeHeaderHeight()}
              nativeFooterHeight={nativeFooterHeight()}
            />
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: nativeHeaderHeight(),
              }}
              blurType={theme.name}
              blurAmount={10}
              reducedTransparencyFallbackColor={
                theme.translucentBackgroundColor
              }
            />
          </>
        ) : (
          <Text style={{textAlign: 'center'}}>
            {internetConnection
              ? 'Loading...'
              : 'Waiting for Internet connection...'}
          </Text>
        )}
      </View>
    </View>
  );
};

export default App;
