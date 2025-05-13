import ReactNativeBlobUtil from 'react-native-blob-util';
import Card from '../models/Card';
import ExpansionSet from '../models/ExpansionSet';
const localCardFilePath = ReactNativeBlobUtil.fs.dirs.DocumentDir;

interface CardData {
  gempId: string;
  front: {
    title: string;
    type: string;
    subType: string;
    ability?: number;
    armor?: number;
    darkSideIcons?: number;
    deploy?: number;
    destiny?: number;
    ferocity?: string;
    forfeit?: number;
    hyperspeed?: number;
    landspeed?: number;
    lightSideIcons?: number;
    maneuver?: number;
    parsec?: number;
    politics?: number;
    power?: number;
    characteristics: string[];
    icons: string[];
    gametext?: string;
    lore?: string;
    imageUrl: string;
    extraText?: string[];
    uniqueness?: string;
  };
  side: string;
  set: string;
  rarity: string;
  abbr?: string[];
  back?: {
    imageUrl?: string;
    gametext?: string;
    extratext?: string;
    extraText?: string[];
  };
  cancels?: string[];
  canceledBy?: string[];
  matching?: string[];
  matchingWeapon?: string[];
  pulledBy?: string[];
  pulls?: string[];
  underlyingCardFor?: string;
  counterpart?: string;
}

const readCardFilePromise = (side: string): Promise<CardData[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localCardFilePath}/${side}.json`, 'utf8')
    .then(data => {
      return data ? JSON.parse(data).cards : [];
    })
    .catch(err => {
      console.log(err);
    });
};

const loadCardDefinitions = (expansionSets: ExpansionSet[]): Promise<Card[]> => {
  return Promise.allSettled([
    readCardFilePromise('Dark'),
    readCardFilePromise('Light'),
  ])
    .then(results => {
      return (results || [])
        .map(r => {
          return (r.value as CardData[])
            .map((c: CardData) => {
              const expansionSet = expansionSets.find((s: ExpansionSet) => s.id === c.set);
              const card = new Card(c, expansionSet);
              return card;
            })
            .filter((c: Card) => !c.title.match(/\(.*AI.*\)/)) // excludes (AI) and (Holo AI 2), etc.
            .filter((c: Card) => c.type != 'Game Aid')
            .sort((a: Card, b: Card) =>
              a.sortTitle > b.sortTitle
                ? 1
                : b.sortTitle > a.sortTitle
                ? -1
                : 0,
            );
        })
        .flat();
    })
    .catch(err => {
      console.log(err);
    });
};

export default loadCardDefinitions;
