import Card from '../models/Card';
import { CardSide } from '../types/enums';

const DOUBLE_SIDED_CARD_IDS = ['200_16', '204_35', '10_42', '205_14'];
const OTHER_SIDEWAYS_CARD_IDS = ['4_167', '9_157', '13_75', '204_54'];
const NOT_A_COMBO_CARD_ID = '7_76'; // Effect card with an & that isn't a combo

class CardPresenter {
  id: string;
  title: string;
  type: string;
  subtype: string;
  side: CardSide;
  imageUrl: string;
  backImageUrl: string;
  rarity: string;
  uniqueness: string;
  sortTitle: string;

  displayTitle: string;
  displayType: string;
  displaySubtype: string;
  displayImageUrl: string;
  displayBackImageUrl: string;
  displayExpansionSet: string;

  offsetY: number;
  offsetHeight: number;
  aspectRatio: number;
  height: number;
  width: number;
  sideways: boolean;
  combo: boolean;
  twoSided: boolean;

  constructor(card: Card) {
    this.id = card.id;
    this.title = card.title;
    this.type = card.type;
    this.subtype = card.subtype;
    this.side = card.side;
    this.imageUrl = card.imageUrl;
    this.backImageUrl = card.backImageUrl;
    this.rarity = card.rarity;
    this.uniqueness = card.uniqueness;

    this.displayExpansionSet = card.expansionSet.name
      .replace('Reflections 2', 'Reflections II')
      .replace('Reflections 3', 'Reflections III')
      .replace('Two Player', '2-Player')
      .replace('mpire ', '') // lol
      .replace('rikes ', '')
      .replace('ack ', '');

    this.sortTitle = this.title.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase();

    this.displayTitle = this.title
      .replaceAll('<>', '◇')
      .replace('(Premiere)', '')
      .replace(/\(Death .* II\)/, '')
      .replace(/\(J.* Palace Sealed Deck\)/, '')
      .replace(/\(T.*ine\)/, '')
      .replace(/\(Cor.*t\)/, '');

    if (
      this.displayTitle.split(' / ')[0] == this.displayTitle.split(' / ')[1]
    ) {
      this.displayTitle = this.displayTitle.split(' / ')[0];
    }

    if (this.type == 'Objective' || this.displayTitle.length > 39) {
      this.displayTitle = this.displayTitle
        .split(' / ')
        .join(' /\n')
        .split(' & ')
        .join(' &\n');
    }

    this.displayType = this.type.split(' #')[0];
    this.displaySubtype = this.subtype ? this.subtype.split(': ')[0] : '';
    this.displayImageUrl = DOUBLE_SIDED_CARD_IDS.includes(this.id)
      ? this.backImageUrl
      : this.imageUrl;
    this.displayBackImageUrl = DOUBLE_SIDED_CARD_IDS.includes(this.id)
      ? this.imageUrl
      : this.backImageUrl;

    this.sideways =
      this.subtype == 'Site' || OTHER_SIDEWAYS_CARD_IDS.includes(this.id);

    this.combo =
      this.title.includes(' & ') &&
      (this.type == 'Interrupt' || this.type == 'Effect') &&
      this.id != NOT_A_COMBO_CARD_ID;
    this.twoSided = this.backImageUrl != null;
    this.height = this.sideways ? 339 : 475;
    this.width = this.sideways ? 475 : 339;
    this.aspectRatio = this.height / this.width;

    if (this.displayType.includes('Test')) {
      this.offsetY = 0;
      this.offsetHeight = 60;
    } else if (this.type == 'Objective') {
      this.offsetY = -10;
      this.offsetHeight = 60;
    } else if (this.subtype == 'Site') {
      this.offsetY = -30;
      this.offsetHeight = 30;
    } else if (OTHER_SIDEWAYS_CARD_IDS.includes(this.id)) {
      this.offsetY = -30;
      this.offsetHeight = 30;
    } else if (this.combo) {
      this.offsetY = -5;
      this.offsetHeight = 80;
    } else {
      this.offsetY = 0;
      this.offsetHeight = 0;
    }
  }
}

export default CardPresenter;