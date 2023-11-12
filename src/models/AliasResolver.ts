import Card from '../models/Card';

class AliasResolver {
  cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;

    let expansionSets = [];
    cards.forEach(card => {
      if (!expansionSets.map(s => s.id).includes(card.expansionSet.id)) {
        expansionSets.push(card.expansionSet);
      }
    });

    this.sets = expansionSets;
  }

  resolve(val: string) {
    const card = this.cards.find(c =>
      c
        .nameAndAliases()
        .map(n => n.toLowerCase())
        .includes(val.toLowerCase()),
    );

    const set = this.sets.find(s =>
      s
        .nameAndAliases()
        .map(n => n.toLowerCase())
        .includes(val.toLowerCase()),
    );

    return card?.sortTitle || set?.name || val;
  }
}

export default AliasResolver;
