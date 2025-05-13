import ReactNativeBlobUtil from 'react-native-blob-util';
import ExpansionSet from '../models/ExpansionSet';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface ExpansionSetData {
  id: string;
  name: string;
  abbr: string;
  gempName: string;
  legacy?: boolean;
}

const loadExpansionSets = (): Promise<ExpansionSet[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/sets.json`, 'utf8')
    .then((data: string) => {
      return JSON.parse(data) as ExpansionSetData[];
    })
    .then((results: ExpansionSetData[]) => {
      return (results || [])
        .filter((s: ExpansionSetData) => !s.legacy) // exclude legacy sets
        .map((s: ExpansionSetData) => new ExpansionSet(s));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadExpansionSets;
