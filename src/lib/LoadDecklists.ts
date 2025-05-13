import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface DecklistData {
  name: string;
  player: string;
  archetype: string;
  tournament: string;
  placement: string;
  date: string;
  cards: Record<string, number>;
  id: string;
}

const loadDecklists = (): Promise<Decklist[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/decklists.json`, 'utf8')
    .then((data: string) => {
      return data ? JSON.parse(data).decklists as DecklistData[] : [];
    })
    .then((results: DecklistData[]) => {
      return (results || []).map((d: DecklistData) => new Decklist(d));
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadDecklists;
