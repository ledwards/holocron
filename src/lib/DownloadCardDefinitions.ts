import ReactNativeBlobUtil from 'react-native-blob-util';
const remoteCardFilePath =
  'https://raw.githubusercontent.com/swccgpc/swccg-card-json/main';
const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const downloadCardFiles = () => {
  const promises = ['Dark', 'Light'].map(async side => {
    await ReactNativeBlobUtil.config({
      fileCache: true,
      path: `${localCardFilePath}/${side}.json`,
    })
      .fetch('GET', `${remoteCardFilePath}/${side}.json`, {})
      .catch(err => {
        console.log(err);
        return new Promise((resolve, reject) => reject(err));
      });
  });

  return Promise.allSettled(promises);
};

export default downloadCardFiles;
