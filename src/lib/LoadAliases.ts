// not sure if file is needed, find another way?

import ReactNativeBlobUtil from 'react-native-blob-util';
import Card from '../models/Card';
const localSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const loadAliases = () => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localSetsFilePath}/sets.json`, 'utf8')
    .then(data => {
      // TODO: load Sets and Abbrvs
      return JSON.parse(data);
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadAliases;
