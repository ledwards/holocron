import ReactNativeBlobUtil from 'react-native-blob-util';
import ExpansionSet from '../models/ExpansionSet';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const loadExpansionSets = (): Promise<ExpansionSet[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/sets.json`, 'utf8')
    .then((data: string) => {
      return JSON.parse(data);
    })
    .then((results: any[]) => {
      return (results || [])
        .filter((s: any) => !s.legacy) // exclude legacy sets
        .map((s: any) => new ExpansionSet(s));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadExpansionSets;
