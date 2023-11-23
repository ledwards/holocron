import ReactNativeBlobUtil from 'react-native-blob-util';
const remoteExpansionSetsFilePath =
  'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const downloadExpansionSets = () => {
  const promise = ReactNativeBlobUtil.config({
    fileCache: true,
    path: `${localExpansionSetsFilePath}/sets.json`,
  })
    .fetch('GET', `${remoteExpansionSetsFilePath}/sets.json`, {})
    .catch(err => {
      console.log(err);
      return new Promise((resolve, reject) => reject(err));
    });

  return promise;
};

export default downloadExpansionSets;
