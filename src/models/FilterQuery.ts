import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';
import { ALL_COMPARATORS } from '../constants/comparators';

class FilterQuery {
  query: string;
  field: Field;
  comparator: Comparator;
  value: string;
  filter: Filter;
  rawField: string;
  rawComparator: string;

  parseQuery() {
    let params = {
      field: null,
      comparator: null,
      value: null,
      rawField: null,
      rawComparator: null,
    }

    // TRY: First, attempt a default query?

    params = this.parseThreePartQuery() || params;
    console.log('<three-part query>: ', params)

    if (!params.field) {
      params = this.parseValidComparatorInvalidField() || params;
      console.log('<valid comparator, invalid field>: ', params)
    }

    if (params.field && !params.comparator && !this.partiallyValidComparator()) {
      params = this.parseDefaultComparator() || params;
      console.log('<default comparator>: ', params)
    }

    if (!params.field && !params.comparator) { // no field or comparator matches
      params.rawField = params.query;
      console.log('<whole query>: ', params)
    }

    if (params.value) {
      params.filter = new Filter(this.field, this.comparator, this.value);
    }

    return params;
  }

  parseThreePartQuery() {
    let allMatches = [];
    const validSeparators = ['\\s+', '$'].concat(ALL_COMPARATORS.map(c => c.nameAndAliases()).flat());

    // ordinary three-part query, e.g. power > 6, matches includes red 5, lore matches isb
    const matches = FIELDS.map(f => {
      const fieldRe = new RegExp(`^(${(f.nameAndAliases().join('|'))})\\s*(${validSeparators.join('|')})(.*)`);
      const fMatches = this.query.match(fieldRe);
      let params = {}

      if (fMatches && fMatches.length > 0) { // field found
        params = {
          field: f,
          rawField: fMatches[1],
          rawComparator: fMatches[2]?.trim() != '' ? fMatches[2]?.trim() : fMatches[3]?.trim(),
        };

        allMatches = f.comparators.map(c => {
          const compRe = new RegExp(`^.+?\\s*(${c.nameAndAliases().join('|')})(.*)`);
          const cMatches = this.query.match(compRe);

          if (cMatches && cMatches.length > 1) { // comparator for the given field found
            return {
              field: f,
              comparator: c,
              value: fMatches[3]?.trim(),
              rawField: fMatches[1],
              rawComparator: cMatches[1],
            };
          }
        }).filter(el => el);
      }

      if (allMatches.length > 0) {
        return allMatches[0];  // sketchy! What's the actual best way to know?
      } else {
        return params;
      }
    }).filter(el => el.field);

    const bestMatch = matches.find(m => m.field && m.comparator) || matches[0];  // sketchy! What's the actual best way to know?

    return bestMatch;
  }

  parseValidComparatorInvalidField() {
    let allMatches = [];

    // invalid field, valid comparator
    allMatches = ALL_COMPARATORS.map(c => {
      const compRe = new RegExp(`^(.+?)\\s*(${c.nameAndAliases().join('|')})\\s*(.+)`);
      const cMatches = this.query.match(compRe);

      if (cMatches && cMatches.length > 1) {
        const rawField = cMatches[1];
        const rawComparator = cMatches[2];
        const value = cMatches[3];

        return {
          field: null,
          comparator: c,
          value: value?.trim(),
          rawField: rawField,
          rawComparator: rawComparator,
        };
      }
    }).filter(el => el);

    return allMatches[0]; // sketchy! What's the actual best way to know?
  }

  parseDefaultComparator() {
    let allMatches = [];

    // default comparator check, e.g. power 6, matches red 5, pulls Yoda
    allMatches = FIELDS.map(f => {
      const fieldRe = new RegExp(`^(${(f.nameAndAliases().join('|'))})\\s+(.+)`);
      const fMatches = this.query.match(fieldRe);

      if (fMatches && fMatches.length > 0) {
        return {
          field: f,
          comparator: f.defaultComparator,
          value: fMatches[2]?.trim(),
          rawField: fMatches[1],
          rawComparator: '',
        }
      }
    }).filter(el => el);

    return allMatches[0]; // sketchy! What's the actual best way to know?
  }

  constructor(query: string) {
    this.query = query.trim();

    if (this.query) {
      const obj = this.parseQuery();

      this.field = obj?.field;
      this.comparator = obj?.comparator;
      this.value = obj?.value;
      this.rawField = obj?.rawField;
      this.rawComparator = obj?.rawComparator;

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
    return FIELDS.map(f => f.name).includes(this.field?.name);
  }

  validComparator() {
    return ALL_COMPARATORS.map(c => c.name).includes(this.comparator?.name);
  }

  partiallyValidComparator() {
    // true when a comparator is partially typed out
    if (!this.rawComparator) {
      return false
    } else {
      return ALL_COMPARATORS.map(c => c.name.indexOf(this.rawComparator) == 0).length > 0;
    }
  }

  usingDefaultComparator() {
    return this.comparator && this.rawComparator == '';
  }

  validValue() {
    return typeof this.value !== 'undefined';
  }

  validFilter() {
    return typeof this.filter !== 'undefined';
  }

  displayFieldName() {
    if (this.field?.name == 'identities') {
      return 'is';
    } else {
      return this.field?.name || this.rawField || this.query;
    }
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
