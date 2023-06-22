import ExpansionSets from '../../data/ExpansionSets.json'

class Card {
  id: string;
  title: string;
  displayTitle: string;
  sortTitle: string;
  type: string;
  displayType: string;
  subType: string;
  displaySubType: string;
  side: string;
  setNumber: string;
  set: string;
  rarity: string;
  imageUrl: string;
  backImageUrl: string;
  displayImageUrl: string;
  offsetY: number;
  offsetHeight: number;
  sideways: boolean;
  combo: boolean;

  constructor(object) {
    this.id = object.id.toString();
    this.title = object.front.title;
    this.type = object.front.type;
    this.displayType = this.type.split(' #')[0];
    this.subType = object.front.subType;
    this.displaySubType = this.subType ? this.subType.split(': ')[0] : '';
    this.side = object.side;
    this.setNumber = object.set;
    this.set = ExpansionSets[object.set];
    this.rarity = object.rarity;
    this.imageUrl = object.front.imageUrl;
    this.backImageUrl = object.back && object.back.imageUrl;
    this.displayImageUrl = ['5621', '5959', '6435', '6501'].includes(this.id) ? this.backImageUrl : this.imageUrl;
    this.sideways = this.subType == 'Site' || ['906', '953', '1656', '5106'].includes(this.id);
    this.combo = this.title.includes(' & ') && (this.type == 'Interrupt' || this.type == 'Effect') && this.id != '2280';

    this.displayTitle = this.title
      .replaceAll('<>', '◇')
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

    this.sortTitle = this.displayTitle
      .replaceAll('•', '')
      .replace('\n', '');

    if (this.displayType == 'Jedi Test') {
      this.offsetY = 0;
      this.offsetHeight = 60;
    } else if (this.type == 'Objective') {
      this.offsetY = -10;
      this.offsetHeight = 60;
    } else if (this.subType == 'Site') {
      this.offsetY = -40;
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
}

export default Card;
