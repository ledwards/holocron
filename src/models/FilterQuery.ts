import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';


// this concept might be wrong? Maybe FilterQuery only exists if there is a valid query and otherwise its display logic?
// or its all here and the couple view helpers in the tsx file are not needed
class FilterQuery {
  query: string;
  value: string;
  field: Field;
  comparator: Comparator;
  filter: Filter;
  unaliasedField: string;
  unaliasedComparator: string;

  constructor(query: string) {
    this.query = query.trim();

    // iterate through all field + field's comparators combo to find the first match
    FIELDS.map(f => {
      const re = new RegExp(`^${f.name}`);
      if (query.match(re)) {
        this.field = f;
        this.unaliasedField = f.name;
      }

      f.comparators.map(c => {
        const re = new RegExp(`^${f.name}\\s*${c.name}`);
        if (this.query.match(re)) { // TODO: aliases, TODO: spacing
          this.comparator = c;
          this.unaliasedComparator = c.name;
          this.value = this.query.replace(re, '').trim();

          if (this.value) {
            this.filter = new Filter(f, c, this.value);
          }
        }
      });
    });
  }

  valid() {
    return this.validField() &&
      this.validComparator() &&
      this.validValue() &&
      typeof this.filter !== 'undefined';// && Object.keys(this.filter.comparators).includes(this.comparator);
  }

  validField() {
    return typeof this.field !== 'undefined';
  }

  validComparator() { // necessary? I think this is just true
    return typeof this.comparator !== 'undefined';    // return this.filter ? this.filter.comparators.includes(this.comparator) : false;
  }

  validValue() {
    return typeof this.value !== 'undefined';
  }

  // TODO: Add aliases for values e.g. abbreviations?
  // Handle aliases consistently for all types of aliases?

  execute(cards: Card[]) {
    if (!this.valid()) {
      return cards;
    }

    return this.filter.execute(cards, this.comparator, this.value);
  }
}

export default FilterQuery;
