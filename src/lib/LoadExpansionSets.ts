import ReactNativeBlobUtil from 'react-native-blob-util';
import ExpansionSet from '../models/ExpansionSet';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const loadExpansionSets = () => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/sets.json`, 'utf8')
    .then(data => {
      return JSON.parse(data);
    })
    .then(results => {
      return (results || [])
        .filter(s => !s.legacy) // exclude legacy sets
        .map(s => new ExpansionSet(s));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadExpansionSets;
