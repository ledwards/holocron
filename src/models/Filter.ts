import Card from './Card';
import Comparator from './Comparator';
import Field from './Field';
import { FilterResult } from '../types/interfaces';

class Filter {
  field: Field;
  comparator: Comparator;
  value: string;

  constructor(field: Field, comparator: Comparator, value: string) {
    this.field = field;
    this.comparator = comparator;
    this.value = value;
  }

  execute(cards: Card[]): FilterResult {
    const startTime = performance.now();
    const filteredCards = cards.filter(c =>
      this.comparator.execute(c, this.field, this.value),
    );
    const executionTime = performance.now() - startTime;
    
    return {
      cards: filteredCards,
      count: filteredCards.length,
      executionTime
    };
  }
}

export default Filter;
