import ReactNativeBlobUtil from 'react-native-blob-util';
import Card from '../models/Card';
import ExpansionSet from '../models/ExpansionSet';
import isExpectedMissingFileError from './isExpectedMissingFileError';
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

interface CardResponse {
  cards: CardData[];
}

const fixtureCardsBySide: Record<'Dark' | 'Light', CardResponse> = {
  Dark: require('../data/__fixtures__/Dark.json') as CardResponse,
  Light: require('../data/__fixtures__/Light.json') as CardResponse,
};

const readCardFilePromise = (side: string): Promise<CardData[]> => {
  return ReactNativeBlobUtil.fs
    .readFile(`${localCardFilePath}/${side}.json`, 'utf8')
    .then(data => {
      return data ? (JSON.parse(data) as CardResponse).cards : [];
    })
    .catch(err => {
      if (!isExpectedMissingFileError(err)) {
        console.log(err);
      }
      if (side === 'Dark' || side === 'Light') {
        return fixtureCardsBySide[side].cards || [];
      }
      return [];
    });
};

/**
 * Upstream ships alternate-image printings as extra rows: "(AI)", "(Holo AI 2)",
 * "(C-Slip AI)" and, since late 2026, "(ALT)". They are the same card as the row
 * they duplicate and usually carry the same gempId.
 */
const isAlternateImagePrinting = (card: Card): boolean =>
  /\(.*AI.*\)|\(ALT\)/.test(card.title);

/**
 * `Card.id` (gempId) is the identity the app keys on — list rows, selection,
 * decklist lookups — so it must be unique in the loaded set. Upstream does not
 * guarantee that: besides alternate images, some ids carry two title variants
 * ("Fanfare (Tatooine) (V)" / "Fanfare (V)"). Keep one row per id, preferring
 * the title with the fewest qualifiers, and say how many were collapsed.
 */
export const onePrintingPerId = (cards: Card[]): Card[] => {
  const keptById = new Map<string, Card>();
  cards.forEach(card => {
    const kept = keptById.get(card.id);
    if (!kept || card.title.length < kept.title.length) {
      keptById.set(card.id, card);
    }
  });

  const collapsed = cards.length - keptById.size;
  if (collapsed > 0) {
    console.log(`[cards] collapsed ${collapsed} duplicate-id printings`);
  }

  return cards.filter(card => keptById.get(card.id) === card);
};

const loadCardDefinitions = (expansionSets: ExpansionSet[]): Promise<Card[]> => {
  return Promise.allSettled([
    readCardFilePromise('Dark'),
    readCardFilePromise('Light'),
  ])
    .then(results => {
      return (results || [])
        .map(r => {
          if (r.status === 'fulfilled' && r.value) {
            return (r.value as CardData[])
              .map((c: CardData) => {
                const expansionSet = expansionSets.find((s: ExpansionSet) => s.id === c.set);
                if (!expansionSet) {
                  return null;
                }
                const card = new Card(c, expansionSet);
                return card;
              })
              .filter((c): c is Card => c !== null)
              .filter((c: Card) => !isAlternateImagePrinting(c))
              .filter((c: Card) => c.type !== 'Game Aid')
              .sort((a: Card, b: Card) =>
                a.sortTitle > b.sortTitle
                  ? 1
                  : b.sortTitle > a.sortTitle
                  ? -1
                  : 0,
              );
          }
          return [];
        })
        .flat();
    })
    .then(onePrintingPerId)
    .catch(err => {
      console.log(err);
      return [] as Card[];
    });
};

export default loadCardDefinitions;
