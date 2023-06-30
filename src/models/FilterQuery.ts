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
    if (this.query) {
      FIELDS.map(f => {
        const fieldRe = new RegExp(`^(${([f.name].concat(f.aliases).join('|'))})`);
        const fMatches = this.query.match(fieldRe);

        if (fMatches && fMatches.length > 0) {
          this.field = f;
          this.unaliasedField = fMatches[0];

          f.comparators.map(c => {
            const compRe = new RegExp(`^${this.unaliasedField}\\s*(${[c.name].concat(c.aliases).join('|')})`);
            const cMatches = this.query.match(compRe); // [1] is the match group

            if (cMatches && cMatches.length > 1) { // TODO: aliases
              this.comparator = c;
              this.unaliasedComparator = cMatches[1];
              const vMatches = this.query.match(`^${this.unaliasedField}\\s*${this.unaliasedComparator}(.*)`); // [1] is the match group
              this.value = vMatches ? vMatches[1]?.trim() : '';

              if (this.value) {
                this.filter = new Filter(f, c, this.value);
              }
            }
          });
        }
      });
    }
  }

  valid() {
    return this.validField() &&
      this.validComparator() &&
      this.validValue() &&
      typeof this.filter !== 'undefined';
  }

  validField() {
    return typeof this.field !== 'undefined';
  }

  validComparator() {
    return typeof this.comparator !== 'undefined';
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

    return this.filter.execute(cards);
  }
}

export default FilterQuery;
