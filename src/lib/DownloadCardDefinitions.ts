import ReactNativeBlobUtil from 'react-native-blob-util';
const remoteCardFilePath =
  'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main';
const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const downloadCardFiles = () => {
  const promises = ['Dark', 'Light'].map(side => {
    ReactNativeBlobUtil.config({
      fileCache: true,
      path: `${localCardFilePath}/${side}.json`,
    }).fetch('GET', `${remoteCardFilePath}/${side}.json`, {});
  });

  return Promise.all(promises);
};

export default downloadCardFiles;
