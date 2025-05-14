import ExpansionSet from './ExpansionSet';
import { CardSide, CardUniqueness } from '../types/enums';
import { CardJSON } from '../types/interfaces';

class Card {
  id: string;
  title: string;
  type: string;
  subtype: string;
  side: CardSide;
  expansionSetId: string;
  expansionSet: ExpansionSet;
  imageUrl: string;
  backImageUrl: string;

  ability: number;
  armor: number;
  dsicons: number;
  deploy: number;
  destiny: number;
  ferocity: number;
  forfeit: number;
  hyperspeed: number;
  landspeed: number;
  lsicons: number;
  maneuver: number;
  parsec: number;
  politics: number;
  power: number;

  extratext: string;
  gametext: string;
  lore: string;

  characteristics: string[];
  icons: string[];
  rarity: string;
  uniqueness: CardUniqueness;
  set: string;

  identities: string[];
  cancels: string[] = [];
  canceledby: string[] = [];
  matching: string[] = [];
  matchingweapon: string[] = [];
  pulledby: string[] = [];
  pulls: string[] = [];
  counterpart = '';
  underlyingcardfor = '';
  abbr: string[] = [];

  sortTitle: string;
  sortAbbr: string[];

  constructor(cardJSON: CardJSON, expansionSetJSON: {
    id: string;
    name: string;
    abbr: string;
    gempName: string;
  }) {
    this.id = cardJSON.gempId;
    this.title = cardJSON.front.title;
    this.type = cardJSON.front.type;
    this.subtype = cardJSON.front.subType;
    this.side = cardJSON.side as CardSide;
    this.expansionSetId = cardJSON.set;
    this.imageUrl = cardJSON.front.imageUrl;
    this.backImageUrl = cardJSON.back?.imageUrl || '';

    this.ability = cardJSON.front.ability || 0;
    this.armor = cardJSON.front.armor || 0;
    this.dsicons = cardJSON.front.darkSideIcons || 0;
    this.deploy = cardJSON.front.deploy || 0;
    this.destiny = cardJSON.front.destiny || 0;
    this.ferocity = parseInt(cardJSON.front.ferocity || '0');
    this.forfeit = cardJSON.front.forfeit || 0;
    this.hyperspeed = cardJSON.front.hyperspeed || 0;
    this.landspeed = cardJSON.front.landspeed || 0;
    this.lsicons = cardJSON.front.lightSideIcons || 0;
    this.maneuver = cardJSON.front.maneuver || 0;
    this.parsec = cardJSON.front.parsec || 0;
    this.politics = cardJSON.front.politics || 0;
    this.power = cardJSON.front.power || 0;

    this.extratext = `${cardJSON.front.extraText?.join(' ') || ''}${
      cardJSON?.back?.extraText ? ' / ' + cardJSON.back.extraText.join(' ') : ''
    }`;
    this.gametext = [cardJSON.front.gametext || '', cardJSON.back?.gametext || ''].join(
      ' / ',
    );
    this.lore = cardJSON.front.lore || '';

    this.characteristics = cardJSON.front.characteristics;
    this.icons = cardJSON.front.icons;
    this.rarity = parseInt(cardJSON.set) < 200 ? cardJSON.rarity : 'V'; // use "V" as the rarity for all virtual cards
    this.side = cardJSON.side as CardSide;
    this.subtype = cardJSON.front.subType;
    this.uniqueness = (cardJSON.front.uniqueness || 'none') as CardUniqueness;
    this.abbr = cardJSON.abbr || [];
    this.identities = [
      cardJSON.front.characteristics || [],
      cardJSON.front.type || '',
      cardJSON.front.subType || '',
      cardJSON.front.icons || [],
      cardJSON.front.extraText || [],
    ].flat().filter(Boolean);
    this.cancels = cardJSON.cancels || [];
    this.canceledby = cardJSON.canceledBy || [];
    this.matching = cardJSON.matching || []; // TODO: rename to matchingstarship?
    this.matchingweapon = cardJSON.matchingWeapon || [];
    this.pulledby = cardJSON.pulledBy || [];
    this.pulls = cardJSON.pulls || [];
    this.underlyingcardfor = cardJSON.underlyingCardFor || '';
    this.counterpart = cardJSON.counterpart || '';

    this.sortTitle = this.title.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    this.sortAbbr = this.abbr.map(a =>
      a.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase(),
    );

    this.expansionSet = new ExpansionSet(expansionSetJSON);
    this.set = this.expansionSet.name;
  }

  nameAndAliases(): string[] {
    return [this.sortTitle, ...this.sortAbbr];
  }

  get(attributeName: string): unknown {
    return (this as Record<string, unknown>)[attributeName];
  }

  getSanitized(attributeName: string): string | unknown {
    const val = this.get(attributeName);
    return typeof val === 'string'
      ? val
          .replaceAll(/[^a-zA-Z0-9 -]/g, '')
          .toLowerCase()
          .trim()
      : val;
  }
}

export default Card;
