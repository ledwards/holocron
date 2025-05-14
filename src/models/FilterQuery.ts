import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';
import {ALL_COMPARATORS} from '../constants/comparators';
import AliasResolver from './AliasResolver';
import { FilterParams, FilterMatch, FilterResult } from '../types/interfaces';

class FilterQuery {
  query: string;
  field?: Field;
  comparator?: Comparator;
  value?: string;
  filter?: Filter;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;

  constructor(query: string) {
    this.query = query.trim();

    if (this.query) {
      const obj = this.parseQuery();

      this.field = obj?.field;
      this.comparator = obj?.comparator;
      this.value = obj?.value;
      this.rawValue = obj?.rawValue;
      this.rawField = obj?.rawField;
      this.rawComparator = obj?.rawComparator;

      if (this.field && this.comparator && this.value) {
        this.filter = new Filter(this.field, this.comparator, this.value);
      }
    }
  }

  parseQuery(): FilterParams {
    let params: FilterParams = {
      field: null,
      comparator: null,
      value: null,
      rawField: null,
      rawComparator: null,
      rawValue: null,
    };

    params = this.parseThreePartQuery() || params;
    // console.log('<three-part query>: ', params);

    if (!params.field && params.comparator) {
      params = this.parseValidComparatorInvalidField() || params;
      // console.log('<valid comparator, invalid field>: ', params);
    }

    if (
      !params.field &&
      !params.comparator &&
      !params.value &&
      !this.partiallyValidComparator()
    ) {
      params = this.parseDefaultComparator() || params;
      // console.log('<default comparator>: ', params);
    }

    if (!params.field && !params.comparator) {
      // no field or comparator matches
      params.rawField = params.query;
      // console.log('<whole query>: ', params);
    }

    if (params.field && params.comparator && params.value) {
      params.filter = new Filter(params.field, params.comparator, params.value);
    }

    return params;
  }

  parseThreePartQuery(): FilterMatch | undefined {
    let allMatches = [];
    // should this include =, <, >, <=, >=, etc.?
    const validSeparators = ['\\s+', '$'].concat(
      ALL_COMPARATORS.map(c => c.nameAndAliases()).flat(),
    );

    // ordinary three-part query, e.g. power > 6, matches includes red 5, lore matches isb
    // this won't match at all if the comparator is missing (e.g. invalid or default)
    const matches = FIELDS.map(f => {
      const fieldRe = new RegExp(
        `^(${f.nameAndAliases().join('|')})\\s*(${validSeparators.join(
          '|',
        )})(.*)`,
      );
      const fMatches = this.query.match(fieldRe);
      let params = {};

      if (fMatches && fMatches.length > 0) {
        // field found
        params = {
          field: f,
          rawField: fMatches[1],
          rawComparator:
            fMatches[2]?.trim() != ''
              ? fMatches[2]?.trim()
              : fMatches[3]?.trim(),
        };

        allMatches = f.comparators
          .map(c => {
            const compRe = new RegExp(
              `^.+?\\s*(${c.nameAndAliases().join('|')})(.*)`,
            );
            const cMatches = this.query.match(compRe);

            if (cMatches && cMatches.length > 1) {
              // comparator for the given field found
              return {
                field: f,
                comparator: c,
                value: fMatches[3]?.trim(),
                rawValue: fMatches[3]?.trim(),
                rawField: fMatches[1],
                rawComparator: cMatches[1],
              };
            }
          })
          .filter(el => el)
          .sort((a, b) => b.rawComparator.length - a.rawComparator.length);
      }

      if (allMatches.length > 0) {
        // if (allMatches.length > 1) {
        //   console.log('Found multiple matches! Using the first of ', allMatches.map(m => [m.field.name, m.comparator.name]));
        // }
        return allMatches[0];
      } else {
        return params;
      }
    }).filter(el => el.field);

    const bestMatch = matches.find(m => m.field && m.comparator) || matches[0]; // sketchy! What's the actual best way to know?

    return bestMatch;
  }

  parseValidComparatorInvalidField(): FilterMatch | undefined {
    let allMatches = [];

    // invalid field, valid comparator
    allMatches = ALL_COMPARATORS.map(c => {
      const compRe = new RegExp(
        `^(.+?)\\s*(${c.nameAndAliases().join('|')})\\s*(.+)`,
      );
      const cMatches = this.query.match(compRe);

      if (cMatches && cMatches.length > 1) {
        const rawField = cMatches[1];
        const rawComparator = cMatches[2];
        const rawValue = cMatches[3];
        const value = cMatches[3];

        return {
          field: null,
          comparator: c,
          value: value?.trim(),
          rawValue: rawValue?.trim(),
          rawField: rawField,
          rawComparator: rawComparator,
        };
      }
    })
      .filter(el => el)
      .sort((a, b) => b.rawComparator.length - a.rawComparator.length);

    // if (allMatches.length > 1) {
    //   console.log('Found multiple matches! Using the first of ', allMatches.map(m => m.comparator.name));
    // }

    return allMatches[0]; // sketchy! What's the actual best way to know?
  }

  parseDefaultComparator(): FilterMatch | undefined {
    let allMatches = [];

    // default comparator check, e.g. power 6, matches luke, pulls cantina
    allMatches = FIELDS.map(f => {
      const fieldRe = new RegExp(`^(${f.nameAndAliases().join('|')})\\s*(.+)`);
      const fMatches = this.query.match(fieldRe);

      if (fMatches && fMatches.length > 0) {
        return {
          field: f,
          comparator: f.defaultComparator,
          value: fMatches[2]?.trim(),
          rawValue: fMatches[2]?.trim(),
          rawField: fMatches[1],
          rawComparator: '',
        };
      }
    }).filter(el => el);

    return allMatches[0]; // sketchy! What's the actual best way to know?
  }

  valid(): boolean {
    return (
      this.validField() &&
      this.validComparator() &&
      this.validValue() &&
      this.validFilter()
    );
  }

  validField(): boolean {
    return FIELDS.map(f => f.name).includes(this.field?.name);
  }

  validComparator(): boolean {
    return ALL_COMPARATORS.map(c => c.name).includes(this.comparator?.name);
  }

  partiallyValidComparator(): boolean {
    // true when a comparator is partially typed out
    if (!this.rawComparator) {
      return false;
    } else {
      return (
        ALL_COMPARATORS.map(c => c.name.indexOf(this.rawComparator) == 0)
          .length > 0
      );
    }
  }

  usingDefaultComparator(): boolean {
    return this.comparator && this.rawComparator == '';
  }

  validValue(): boolean {
    return typeof this.value !== 'undefined';
  }

  validFilter(): boolean {
    return typeof this.filter !== 'undefined';
  }

  displayFieldName(): string {
    if (this.field?.name == 'identities') {
      return 'is';
    } else {
      return this.field?.name || this.rawField || this.query;
    }
  }

  displayComparatorName(): string | undefined {
    return this.validComparator() ? this.comparator?.name : this.rawComparator;
  }

  execute(cards: Card[]): Card[] {
    const aliasResolver = new AliasResolver(cards);
    const aliasResolvedValue = aliasResolver.resolve(this.value);

    if (aliasResolvedValue && this.filter) {
      this.value = aliasResolvedValue;
      this.filter.value = aliasResolvedValue;
    }

    if (!this.valid()) {
      return [];
    }

    const result = this.filter.execute(cards);
    return result.cards;
  }

  length(cards: Card[]): number {
    return this.execute(cards).length;
  }
}

export default FilterQuery;
