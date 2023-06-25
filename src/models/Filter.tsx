import Card from './Card';

class Filter {
  field: string;
  comparators: object; // map a string/character to a comparator function that takes card, attr, val and returns boolean

  constructor(field: string, comparators: object) {
    this.field = field;
    this.comparators = comparators;
  }

  select(cards: Card[], comparator: string, value: string) {
    return cards.filter(c => (this.comparators as any)[comparator](c, this.field, value));
  }
}

export default Filter;
