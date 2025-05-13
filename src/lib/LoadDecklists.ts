import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

const loadDecklists = (): Promise<Decklist[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/decklists.json`, 'utf8')
    .then((data: string) => {
      return data ? JSON.parse(data).decklists : [];
    })
    .then((results: any[]) => {
      return (results || []).map((d: any) => new Decklist(d));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadDecklists;
