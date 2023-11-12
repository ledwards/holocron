import Card from './Card';

// TODO: Not using this right now, but could be a good refactor for search logic
class CardRepo {
  cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  findByTitleAndAlias(title: string) {
    return this.cards.find(card => [card.title, ...card.abbr].includes(title));
  }
}

export default CardRepo;
