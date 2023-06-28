import Card from './Card';
import Comparator from './Comparator';
import Field from './Field';

class Filter {
  field: Field;
  comparator: Comparator;
  value: string;

  constructor(field: Field, comparator: Comparator, value: string) {
    this.field = field;
    this.comparator = comparator;
    this.value = value;
  }

  execute(cards: Card[], comparator: Comparator) {
    return cards.filter(c => comparator.execute(c, this.field.name, this.value));
  }
}

export default Filter;
