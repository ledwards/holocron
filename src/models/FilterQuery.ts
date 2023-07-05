import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';
import { ALL_COMPARATORS } from '../constants/comparators';

// this concept might be wrong? Maybe FilterQuery only exists if there is a valid query and otherwise its display logic?
// or its all here and the couple view helpers in the tsx file are not needed
class FilterQuery {
  query: string;
  value: string;
  field: Field;
  comparator: Comparator;
  filter: Filter;
  rawField: string;
  rawComparator: string;

  constructor(query: string) {
    this.query = query.trim();

    if (this.query) {
      const validSeparators = ['\\s+', '$'].concat(ALL_COMPARATORS.map(c => c.nameAndAliases()).flat());
      const validFields = FIELDS.map(f => f.nameAndAliases()).flat();

      FIELDS.map(f => {
        const fieldRe = new RegExp(`^(${(f.nameAndAliases().join('|'))})\\s*(${validSeparators.join('|')})`);
        const fMatches = this.query.match(fieldRe);

        if (fMatches && fMatches.length > 0) { // field found
          this.field = f;
          this.rawField = fMatches[1]; // [1] is the match group

          f.comparators.map(c => {
            const compRe = new RegExp(`^.+\\s*(${c.nameAndAliases().join('|')})(.+)`);
            const cMatches = this.query.match(compRe); // [1] is the match group

            if (cMatches && cMatches.length > 1) { // comparator for the given field found
              this.comparator = c;
              this.rawComparator = cMatches[1];
              this.value = cMatches[2];
              // TODO: Some values should have aliases...though I can't think of an example rn
            }
          });
        }
      });

      if (this.query && !this.validField()) { // no field matches
        ALL_COMPARATORS.map(c => {
          const compRe = new RegExp(`^(.+)\\s*(${c.nameAndAliases().join('|')})`);
          const cMatches = this.query.match(compRe); // [1] is the match group for the field, [2] is the match group for the comparator

          if (cMatches && cMatches.length > 1) { // comparator for an errored found
            this.comparator = c;
            this.rawField = cMatches[1];
            this.rawComparator = cMatches[2];

            // TODO: Some values should have aliases...though I can't think of an example rn
            const vMatches = this.query.match(`^${this.rawField}\\s*${this.rawComparator}(.*)`); // [1] is the match group
            this.value = vMatches ? vMatches[1]?.trim() : '';
          }
        });
      }

      if (this.query && !this.validField() && !this.validComparator()) { // no field or comparator matches
        this.rawField = this.query;
      }

      if (this.value) {
        this.filter = new Filter(this.field, this.comparator, this.value);
      }
    }
  }

  valid() {
    return this.validField() &&
      this.validComparator() &&
      this.validValue() &&
      this.validFilter();
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

  validFilter() {
    return typeof this.filter !== 'undefined';
  }

  displayFieldName() {
    return this.validField() ? this.field?.name : this.rawField;
  }

  displayComparatorName() {
    return this.validComparator() ? this.comparator?.name : this.rawComparator;
  }

  execute(cards: Card[]) {
    if (!this.valid()) {
      return [];
    }

    return this.filter.execute(cards);
  }
}

export default FilterQuery;
