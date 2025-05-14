import Card from '../models/Card';

interface ExpansionSet {
  id: string;
  name: string;
  nameAndAliases: () => string[];
}

class AliasResolver {
  cards: Card[];
  sets: ExpansionSet[] = [];

  constructor(cards: Card[]) {
    this.cards = cards;

    const expansionSets: ExpansionSet[] = [];
    cards.forEach(card => {
      if (card.expansionSet && expansionSets.map(s => s.id).includes(card.expansionSet.id)) {
        expansionSets.push(card.expansionSet);
      }
    });

    this.sets = expansionSets;
  }

  resolve(val: string) {
    const card = this.cards.find(c => {
      if (c && typeof c.nameAndAliases === 'function') {
        const aliases = c.nameAndAliases();
        return aliases && aliases.some(n => 
          typeof n === 'string' && n.toLowerCase().includes(val.toLowerCase())
        );
      }
      return false;
    });

    const set = this.sets.find(s => {
      if (s && typeof s.nameAndAliases === 'function') {
        const aliases = s.nameAndAliases();
        return aliases && aliases.some(n => 
          typeof n === 'string' && n.toLowerCase().includes(val.toLowerCase())
        );
      }
      return false;
    });

    return card?.sortTitle || set?.name || val;
  }
}

export default AliasResolver;
