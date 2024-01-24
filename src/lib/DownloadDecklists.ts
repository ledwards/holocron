import ReactNativeBlobUtil from 'react-native-blob-util';
const remoteExpansionSetsFilePath =
  'https://raw.githubusercontent.com/ledwards/swccg-data/main';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const downloadDecklists = () => {
  const promise = ReactNativeBlobUtil.config({
    fileCache: true,
    path: `${localExpansionSetsFilePath}/decklists.json`,
  })
    .fetch('GET', `${remoteExpansionSetsFilePath}/public/decklists.json`, {})
    .catch(err => {
      console.log(err);
      return new Promise((resolve, reject) => reject(err));
    });

  return promise;
};

export default downloadDecklists;
