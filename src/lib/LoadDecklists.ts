import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
const localExpansionSetsFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface DecklistJSON {
  slug: string;
  region?: string;
  title: string;
  url: string;
  date: string;
  side: string;
  plaintext: string;
  cards: Record<string, number>;
  tournament?: {
    name: string;
    shortName: string;
    eventName: string;
    date: string;
    format: string;
    round: string;
  };
  archetype: {
    name: string;
    shortName: string;
    aliases: string[];
    modifiers: string[];
    imageUrl: string;
    objective?: string;
    startingLocation?: string;
    startingInterrupt?: string;
  };
  player: {
    name: string;
    aliases: string[];
  };
}

interface DecklistsResponse {
  decklists: DecklistJSON[];
}

const loadDecklists = (): Promise<Decklist[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/decklists.json`, 'utf8')
    .then((data: string) => {
      return data ? (JSON.parse(data) as DecklistsResponse).decklists : [];
    })
    .then((results: DecklistJSON[]) => {
      return (results || []).map((d: DecklistJSON) => new Decklist(d));
    })
    .catch(err => {
      console.log(err);
      return [];
    });
};

export default loadDecklists;
