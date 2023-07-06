import ExpansionSets from '../../data/ExpansionSets.json'

class Card {
  id: string;
  title: string;
  type: string;
  subtype: string;
  side: string;
  setNumber: string;
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
  set: string;
  uniqueness: string;

  identities: string[];

  // TOOD: "is" should be a FIELD, so that a and canceledBy, etc. can be handlded
  // canceledBy - is canceled by Y
  // cancels - cancels Y
  // counterpart - [Dark/Light] counterpart to Y
  // matching - matches Y
  // matchingWeapon - matches Y / matching weapon Y
  // pulledBy - is pulled by Y
  // pulls - pulls Y
  // underlyingCardFor

  sortTitle: string;
  abbr: string;

  displayTitle: string;
  displayType: string;
  displaySubtype: string;
  displayImageUrl: string;
  displayBackImageUrl: string;
  displaySet: string;

  offsetY: number;
  offsetHeight: number;
  aspectRatio: number;
  height: number;
  width: number;
  sideways: boolean;
  combo: boolean;
  twoSided: boolean;

  constructor(object) {
    this.id = object.id.toString();
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

    this.extratext = `${object.front.extraText?.join(' ')}${object?.back?.extratext ? ' / ' + object.back.extraText.join(' ') : ''}`;
    this.gametext = [object.front.gametext, object.back?.gametext].join(' / ');
    this.lore = object.front.lore;
    this.title = object.front.title;
    this.type = object.front.type;

    this.characteristics = object.front.characteristics;
    this.icons = object.front.icons;
    this.rarity = object.rarity;
    this.set = (ExpansionSets as any)[object.set];
    this.side = object.side;
    this.subtype = object.front.subType;
    this.uniqueness = object.front.uniqueness || 'none';
    this.abbr = object.abbr;
    this.identities = [object.front.characteristics, object.front.type, object.front.subType, object.front.icons].flat();

    this.sortTitle = this.title
      .replaceAll(/[^a-zA-Z0-9 -]/g, '')
      .toLowerCase();

    this.displayTitle = this.title
      .replaceAll('<>', '◇')
      .replace('(Premiere)', '')
      .replace('(Death Star II)', '')
      .replace("(Jabba's Palace Sealed Deck)", '')
      .replace('(Tatooine)', '')
      .replace('(Coruscant)', '');

    if (this.displayTitle.split(' / ')[0] == this.displayTitle.split(' / ')[1]) {
      this.displayTitle = this.displayTitle.split(' / ')[0];
    }

    if (this.type == 'Objective' || this.displayTitle.length > 39) {
      this.displayTitle = this.displayTitle
        .split(' / ').join(' /\n')
        .split(' & ').join(' &\n');
    }

    this.displayType = this.type.split(' #')[0];
    this.displaySubtype = this.subtype ? this.subtype.split(': ')[0] : '';
    this.displayImageUrl = ['5621', '5959', '6435', '6501'].includes(this.id) ? this.backImageUrl : this.imageUrl;
    this.displayBackImageUrl = ['5621', '5959', '6435', '6501'].includes(this.id) ? this.imageUrl : this.backImageUrl;
    this.displaySet = ExpansionSets[object.set];

    this.sideways = this.subtype == 'Site' || ['906', '953', '1656', '5106'].includes(this.id);
    this.combo = this.title.includes(' & ') && (this.type == 'Interrupt' || this.type == 'Effect') && this.id != '2280';
    this.twoSided = this.backImageUrl != null;
    this.height = this.sideways ? 339 : 475;
    this.width = this.sideways ? 475 : 339;
    this.aspectRatio = this.sideways ? 339 / 475 : 475 / 339;

    if (this.displayType == 'Jedi Test') {
      this.offsetY = 0;
      this.offsetHeight = 60;
    } else if (this.type == 'Objective') {
      this.offsetY = -10;
      this.offsetHeight = 60;
    } else if (this.subtype == 'Site') {
      this.offsetY = -30;
      this.offsetHeight = 30;
    } else if (this.sideways && (this.type == 'Starship' || this.type == 'Weapon')) {
      this.offsetY = -74;
      this.offsetHeight = 90;
    } else if (this.combo) {
      this.offsetY = -5;
      this.offsetHeight = 80;
    } else {
      this.offsetY = 0;
      this.offsetHeight = 0;
    }
  }

  get(attributeName: string) {
    // TODO: Aliases for attributes
    return (this as any)[attributeName];
  }
}

export default Card;
