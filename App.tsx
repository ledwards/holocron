/**
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import SearchableCardList from './src/components/SearchableCardList';
import ReactNativeBlobUtil from 'react-native-blob-util';

const App = () => {
  const [isDarkDownloadReady, setIsDarkDownloadReady] = useState(false);
  const [isLightDownloadReady, setIsLightDownloadReady] = useState(false);
  const [lightCards, setLightCards] = useState([]);
  const [darkCards, setDarkCards] = useState([]);

  const remoteCardFilePath =
    'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main';
  const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

  const downloadCardFiles = (path: string) => {
    ReactNativeBlobUtil.config({
      fileCache: true,
      path: `${localCardFilePath}/Dark.json`,
    })
      .fetch('GET', `${path}/Dark.json`, {})
      .then(res => {
        setIsDarkDownloadReady(true);
      });

    ReactNativeBlobUtil.config({
      fileCache: true,
      path: `${localCardFilePath}/Light.json`,
    })
      .fetch('GET', `${path}/Light.json`, {})
      .then(res => {
        setIsLightDownloadReady(true);
      });
  };

  const loadCardFiles = () => {
    ReactNativeBlobUtil.fs
      .readFile(`${localCardFilePath}/Dark.json`, 'utf8')
      .then(data => {
        setDarkCards(JSON.parse(data)['cards']);
      })
      .catch(err => {
        console.log(err);
      });

    ReactNativeBlobUtil.fs
      .readFile(`${localCardFilePath}/Light.json`, 'utf8')
      .then(data => {
        setLightCards(JSON.parse(data)['cards']);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const allCards = () => [...darkCards, ...lightCards];

  useEffect(() => {
    downloadCardFiles(remoteCardFilePath);
  }, []);

  useEffect(() => {
    loadCardFiles();
  }, [isDarkDownloadReady, isLightDownloadReady]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {darkCards.length > 0 && lightCards.length > 0 ? (
        <SearchableCardList cards={allCards()} />
      ) : (
        //<Text>{allCards().length}</Text>
        <Text>Loading...</Text>
      )}
    </SafeAreaView>
  );
};

export default App;
