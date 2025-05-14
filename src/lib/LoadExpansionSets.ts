import ReactNativeBlobUtil from 'react-native-blob-util';
import ExpansionSet from '../models/ExpansionSet';
import { ExpansionSetJSON } from '../types/interfaces';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface ExpansionSetsResponse {
  sets: ExpansionSetJSON[];
}

const loadExpansionSets = (): Promise<ExpansionSet[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/sets.json`, 'utf8')
    .then((data: string) => {
      return data ? (JSON.parse(data) as ExpansionSetsResponse).sets : [];
    })
    .then((results: ExpansionSetJSON[]) => {
      return (results || [])
        .filter((s: ExpansionSetJSON) => !s.legacy) // exclude legacy sets
        .map((s: ExpansionSetJSON) => new ExpansionSet(s));
    })
    .catch(err => {
      console.log(err);
      return [] as ExpansionSet[];
    });
};

export default loadExpansionSets;
