import Card from '../models/Card';
import ExpansionSet from '../models/ExpansionSet';

class AliasMap {
  cards: Card[];
  sets: ExpansionSet[];

  constructor(cards: Card[], sets: ExpansionSet[]) {
    this.cards = cards;
    this.sets = sets;
  }

  resolve(val: string) {
    const card = this.cards.find(c => c.nameAndAliases().includes(val)); // TODO: Make this fuzzy-find
    const set = this.sets.find(s => s.name === val); // TODO: Make this fuzzy-find

    return card?.sortTitle || set?.name || val;
  }
}

export default AliasMap;
