import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const readTournamentDecklistsFilePromise = () => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localCardFilePath}/decklists.json`, 'utf8')
    .then(data => {
      return data ? JSON.parse(data) : [];
    })
    .catch(err => {
      console.log(err);
    });
};

const loadTournamentDecklists = () =>
  readTournamentDecklistsFilePromise()
    .then(results => {
      null;
    })
    .catch(err => {
      console.log(err);
    });

export default loadTournamentDecklists;
