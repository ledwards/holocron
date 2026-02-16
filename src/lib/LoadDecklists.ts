import ReactNativeBlobUtil from 'react-native-blob-util';
import Decklist from '../models/Decklist';
import isExpectedMissingFileError from './isExpectedMissingFileError';
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

const normalizeDecklistsPayload = (
  payload: DecklistsResponse | DecklistJSON[],
): DecklistJSON[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.decklists || [];
};

const loadDecklists = (): Promise<Decklist[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localExpansionSetsFilePath}/decklists.json`, 'utf8')
    .then((data: string) => {
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data) as DecklistsResponse | DecklistJSON[];
      return normalizeDecklistsPayload(parsed);
    })
    .then((results: DecklistJSON[]) => {
      return (results || []).map((d: DecklistJSON) => new Decklist(d));
    })
    .catch(err => {
      if (!isExpectedMissingFileError(err)) {
        console.log(err);
      }
      return [];
    });
};

export default loadDecklists;
