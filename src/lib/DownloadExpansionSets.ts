import ReactNativeBlobUtil from 'react-native-blob-util';
const remoteExpansionSetsFilePath =
  'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const downloadExpansionSets = () => {
  const promise = ReactNativeBlobUtil.config({
    fileCache: true,
    path: `${localExpansionSetsFilePath}/sets.json`,
  }).fetch('GET', `${remoteExpansionSetsFilePath}/sets.json`, {});

  return promise;
};

export default downloadExpansionSets;
