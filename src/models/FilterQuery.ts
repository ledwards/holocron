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

      FIELDS.map(f => {
        const fieldRe = new RegExp(`^(${(f.nameAndAliases().join('|'))})\\s*(${validSeparators.join('|')})`);
        const fMatches = this.query.match(fieldRe);

        if (fMatches && fMatches.length > 0) { // field found
          this.field = f;
          this.rawField = fMatches[1]; // [1] is the match group

          const allMatches = f.comparators.map(c => {
            const compRe = new RegExp(`^.+?\\s*(${c.nameAndAliases().join('|')})(.+)`);
            const cMatches = this.query.match(compRe); // [1] is the match group

            if (cMatches && cMatches.length > 1) { // comparator for the given field found
              return {
                comparator: c,
                rawComparator: cMatches[1],
                value: cMatches[2]?.trim(),
              };
            }
          }).filter(el => el);

          const bestMatch = allMatches[0]; // dubious! What's the actual best way to know?

          this.comparator = bestMatch?.comparator;
          this.rawComparator = bestMatch?.rawComparator;
          this.value = bestMatch?.value;
        }
      });

      if (this.query && !this.validField()) { // no field matches
        const allMatches = ALL_COMPARATORS.map(c => {
          const compRe = new RegExp(`^(.+?)\\s*(${c.nameAndAliases().join('|')})\\s*(.+)`);
          const cMatches = this.query.match(compRe); // [1] is the match group for the field, [2] is the match group for the comparator

          if (cMatches && cMatches.length > 1) { // comparator for an errored found
            const rawField = cMatches[1];
            const rawComparator = cMatches[2];
            const value = cMatches[3];

            return {
              comparator: c,
              rawField: rawField,
              rawComparator: rawComparator,
              value: value?.trim(),
            };
          }
        }).filter(el => el);

        const bestMatch = allMatches[0]; // dubious! What's the actual best way to know?

        // this.field should be null
        this.comparator = bestMatch?.comparator;
        this.rawField = bestMatch?.rawField;
        this.rawComparator = bestMatch?.rawComparator;
        this.value = bestMatch?.value;
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
