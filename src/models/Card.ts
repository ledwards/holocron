import ExpansionSet from './ExpansionSet';

class Card {
  id: string;
  title: string;
  type: string;
  subtype: string;
  side: string;
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
  uniqueness: string;
  set: string;

  identities: string[];
  cancels: string[];
  canceledby: string[];
  matching: string[];
  matchingweapon: string[];
  pulledby: string[];
  pulls: string[];
  counterpart: string;
  underlyingcardfor: string;
  abbr: string[];

  sortTitle: string;
  sortAbbr: string[];

  constructor(cardJSON: {
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
  }, expansionSetJSON: {
    id: string;
    name: string;
    abbr: string;
    gempName: string;
  }) {
    this.id = cardJSON.gempId;
    this.title = cardJSON.front.title;
    this.type = cardJSON.front.type;
    this.subtype = cardJSON.front.subType;
    this.side = cardJSON.side;
    this.expansionSetId = cardJSON.set;
    this.imageUrl = cardJSON.front.imageUrl;
    this.backImageUrl = cardJSON.back && cardJSON.back.imageUrl;

    this.ability = cardJSON.front.ability;
    this.armor = cardJSON.front.armor;
    this.dsicons = cardJSON.front.darkSideIcons;
    this.deploy = cardJSON.front.deploy;
    this.destiny = cardJSON.front.destiny;
    this.ferocity = parseInt(cardJSON.front.ferocity);
    this.forfeit = cardJSON.front.forfeit;
    this.hyperspeed = cardJSON.front.hyperspeed;
    this.landspeed = cardJSON.front.landspeed;
    this.lsicons = cardJSON.front.lightSideIcons;
    this.maneuver = cardJSON.front.maneuver;
    this.parsec = cardJSON.front.parsec;
    this.politics = cardJSON.front.politics;
    this.power = cardJSON.front.power;

    this.extratext = `${cardJSON.front.extraText?.join(' ')}${
      cardJSON?.back?.extratext ? ' / ' + cardJSON.back.extraText.join(' ') : ''
    }`;
    this.gametext = [cardJSON.front.gametext, cardJSON.back?.gametext].join(
      ' / ',
    );
    this.lore = cardJSON.front.lore;

    this.characteristics = cardJSON.front.characteristics;
    this.icons = cardJSON.front.icons;
    this.rarity = parseInt(cardJSON.set) < 200 ? cardJSON.rarity : 'V'; // use "V" as the rarity for all virtual cards
    this.side = cardJSON.side;
    this.subtype = cardJSON.front.subType;
    this.uniqueness = cardJSON.front.uniqueness || 'none'; // TODO: This should be some kind of enum?
    this.abbr = cardJSON.abbr;
    this.identities = [
      cardJSON.front.characteristics,
      cardJSON.front.type,
      cardJSON.front.subType,
      cardJSON.front.icons,
      cardJSON.front.extraText,
    ].flat();
    this.cancels = cardJSON.cancels;
    this.canceledby = cardJSON.canceledBy;
    this.matching = cardJSON.matching; // TODO: rename to matchingstarship?
    this.matchingweapon = cardJSON.matchingWeapon;
    this.pulledby = cardJSON.pulledBy;
    this.pulls = cardJSON.pulls;
    this.underlyingcardfor = cardJSON.underlyingCardFor;
    this.counterpart = cardJSON.counterpart;

    this.sortTitle = this.title.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    this.sortAbbr = (this.abbr || []).map(a =>
      a.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase(),
    );

    this.expansionSet = new ExpansionSet(expansionSetJSON);
    this.set = this.expansionSet.name;
  }

  nameAndAliases(): string[] {
    return [this.sortTitle, ...this.sortAbbr];
  }

  get(attributeName: string): any {
    return (this as any)[attributeName];
  }

  getSanitized(attributeName: string): string | any {
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
