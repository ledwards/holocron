import Card from './Card';

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
