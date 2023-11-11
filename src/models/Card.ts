import ExpansionSet from './ExpansionSet';

class Card {
  id: string;
  title: string;
  type: string;
  subtype: string;
  side: string;
  setNumber: string;
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
  // set: string; // TODO sets: come back!
  uniqueness: string;

  identities: string[];
  cancels: string[];
  canceledby: string[];
  matching: string[];
  matchingweapon: string[];
  pulledby: string[];
  pulls: string[];
  underlyingcardfor: string[];
  counterpart: string;
  // abbr: string;
  abbr: string[];

  sortTitle: string;
  sortAbbr: string[];

  constructor(object) {
    this.id = object.gempId;
    this.title = object.front.title;
    this.type = object.front.type;
    this.subtype = object.front.subType;
    this.side = object.side;
    this.setNumber = object.set;
    this.imageUrl = object.front.imageUrl;
    this.backImageUrl = object.back && object.back.imageUrl;

    this.ability = object.front.ability;
    this.armor = object.front.armor;
    this.dsicons = object.front.darkSideIcons;
    this.deploy = object.front.deploy;
    this.destiny = object.front.destiny;
    this.ferocity = parseInt(object.front.ferocity);
    this.forfeit = object.front.forfeit;
    this.hyperspeed = object.front.hyperspeed;
    this.landspeed = object.front.landspeed;
    this.lsicons = object.front.lightSideIcons;
    this.maneuver = object.front.maneuver;
    this.parsec = object.front.parsec;
    this.politics = object.front.politics;
    this.power = object.front.power;

    this.extratext = `${object.front.extraText?.join(' ')}${
      object?.back?.extratext ? ' / ' + object.back.extraText.join(' ') : ''
    }`;
    this.gametext = [object.front.gametext, object.back?.gametext].join(' / ');
    this.lore = object.front.lore;

    this.characteristics = object.front.characteristics;
    this.icons = object.front.icons;
    this.rarity = parseInt(object.setNumber) < 200 ? object.rarity : 'V'; // use "V" as the rarity for all virtual cards
    // this.set = (ExpansionSets as any)[object.set]; // TODO sets: populate this somehow
    this.side = object.side;
    this.subtype = object.front.subType;
    this.uniqueness = object.front.uniqueness || 'none'; // TODO: This should be some kind of enum?
    this.abbr = object.abbr;
    this.identities = [
      object.front.characteristics,
      object.front.type,
      object.front.subType,
      object.front.icons,
      object.front.extraText,
    ].flat();
    this.cancels = object.cancels;
    this.canceledby = object.canceledBy;
    this.matching = object.matching; // TODO: rename to matchingstarship?
    this.matchingweapon = object.matchingWeapon;
    this.pulledby = object.pulledBy;
    this.pulls = object.pulls;
    this.underlyingcardfor = object.underlyingCardFor;
    this.counterpart = object.counterpart;

    this.sortTitle = this.title.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    this.sortAbbr = (this.abbr || []).map(a =>
      a.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase(),
    );
  }

  nameAndAliases() {
    return [this.sortTitle, ...this.sortAbbr];
  }

  get(attributeName: string) {
    return (this as any)[attributeName];
  }

  getSanitized(attributeName: string) {
    // TODO: make sanitize fn
    // make a functions dir for this and aliases
    // use this every place i do the dumb regex
    const val = this.get(attributeName);
    return typeof val == 'string'
      ? val
          .replaceAll(/[^a-zA-Z0-9 -]/g, '')
          .toLowerCase()
          .trim()
      : val;
  }
}

export default Card;
