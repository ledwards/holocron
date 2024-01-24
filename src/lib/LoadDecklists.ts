import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const loadDecklists = () => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/decklists.json`, 'utf8')
    .then(data => {
      return data ? JSON.parse(data).decklists : [];
    })
    .then(results => {
      return (results || []).map(d => new Decklist(d));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadDecklists;
