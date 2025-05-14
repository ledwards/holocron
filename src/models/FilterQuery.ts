import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';
import {ALL_COMPARATORS} from '../constants/comparators';
import AliasResolver from './AliasResolver';

/**
 * Represents the parameters for a filter query
 */
export interface FilterParams {
  field: Field | null;
  comparator: Comparator | null;
  value: string | null;
  rawField: string | null;
  rawComparator: string | null;
  rawValue: string | null;
  filter?: Filter;
  query?: string;
}

/**
 * Represents a matched filter component result
 */
export interface FilterMatch {
  field?: Field;
  comparator?: Comparator;
  value?: string;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;
}

/**
 * Represents the result of a filter operation
 */
export interface FilterResult {
  cards: Card[];
  count: number;
  executionTime?: number;
}

/**
 * FilterQuery class that parses and executes natural language query filters
 * for searching through card data.
 */
class FilterQuery {
  query: string;
  field?: Field;
  comparator?: Comparator;
  value?: string;
  filter?: Filter;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;

  /**
   * Creates a new FilterQuery instance
   * @param query The query string to parse
   */
  constructor(query: string) {
    this.query = query.trim();

    if (this.query) {
      const obj = this.parseQuery();

      this.field = obj?.field || undefined;
      this.comparator = obj?.comparator || undefined;
      this.value = obj?.value || undefined;
      this.rawValue = obj?.rawValue || undefined;
      this.rawField = obj?.rawField || undefined;
      this.rawComparator = obj?.rawComparator || undefined;

      if (this.field && this.comparator && this.value) {
        this.filter = new Filter(this.field, this.comparator, this.value);
      }
    }
  }

  /**
   * Parse the query string into filter components
   * @returns Parameters for constructing a filter
   */
  parseQuery(): FilterParams {
    let params: FilterParams = {
      field: null,
      comparator: null,
      value: null,
      rawField: null,
      rawComparator: null,
      rawValue: null,
      query: this.query
    };

    const threePartQuery = this.parseThreePartQuery();
    if (threePartQuery) {
      params = {
        ...params,
        field: threePartQuery.field || null,
        comparator: threePartQuery.comparator || null,
        value: threePartQuery.value || null,
        rawField: threePartQuery.rawField || null,
        rawComparator: threePartQuery.rawComparator || null,
        rawValue: threePartQuery.rawValue || null
      };
    }

    if (!params.field && params.comparator) {
      const validComparatorInvalidField = this.parseValidComparatorInvalidField();
      if (validComparatorInvalidField) {
        params = {
          ...params,
          field: validComparatorInvalidField.field || null,
          comparator: validComparatorInvalidField.comparator || null,
          value: validComparatorInvalidField.value || null,
          rawField: validComparatorInvalidField.rawField || null,
          rawComparator: validComparatorInvalidField.rawComparator || null,
          rawValue: validComparatorInvalidField.rawValue || null
        };
      }
    }

    if (
      !params.field &&
      !params.comparator &&
      !params.value &&
      !this.partiallyValidComparator()
    ) {
      const defaultComparator = this.parseDefaultComparator();
      if (defaultComparator) {
        params = {
          ...params,
          field: defaultComparator.field || null,
          comparator: defaultComparator.comparator || null,
          value: defaultComparator.value || null,
          rawField: defaultComparator.rawField || null,
          rawComparator: defaultComparator.rawComparator || null,
          rawValue: defaultComparator.rawValue || null
        };
      }
    }

    if (!params.field && !params.comparator) {
      // no field or comparator matches
      params.rawField = this.query;
    }

    if (params.field && params.comparator && params.value) {
      params.filter = new Filter(params.field, params.comparator, params.value);
    }

    return params;
  }

  /**
   * Parse a three-part query (field, comparator, value)
   * @returns A match object if found, undefined otherwise
   */
  parseThreePartQuery(): FilterMatch | undefined {
    const allMatches: FilterMatch[] = [];
    // should this include =, <, >, <=, >=, etc.?
    const validSeparators = ['\\s+', '$'].concat(
      ALL_COMPARATORS.map(c => c.nameAndAliases()).flat(),
    );

    // ordinary three-part query, e.g. power > 6, matches includes red 5, lore matches isb
    // this won't match at all if the comparator is missing (e.g. invalid or default)
    const matches: FilterMatch[] = [];
    
    FIELDS.forEach(f => {
      const fieldRe = new RegExp(
        `^(${f.nameAndAliases().join('|')})\\s*(${validSeparators.join(
          '|',
        )})(.*)`,
      );
      const fMatches = this.query.match(fieldRe);
      let params: FilterMatch = {};

      if (fMatches && fMatches.length > 0) {
        // field found
        params = {
          field: f,
          rawField: fMatches[1],
          rawComparator:
            fMatches[2]?.trim() !== ''
              ? fMatches[2]?.trim()
              : fMatches[3]?.trim(),
        };

        let foundComparatorMatches = false;
        
        f.comparators.forEach(c => {
          const compRe = new RegExp(
            `^.+?\\s*(${c.nameAndAliases().join('|')})(.*)`,
          );
          const cMatches = this.query.match(compRe);

          if (cMatches && cMatches.length > 1) {
            // comparator for the given field found
            const match: FilterMatch = {
              field: f,
              comparator: c,
              value: fMatches[3]?.trim() || '',
              rawValue: fMatches[3]?.trim() || '',
              rawField: fMatches[1],
              rawComparator: cMatches[1],
            };
            allMatches.push(match);
            foundComparatorMatches = true;
          }
        });
        
        if (!foundComparatorMatches && params.field) {
          matches.push(params);
        }
      }
    });

    if (allMatches.length > 0) {
      // Sort by comparator length to find most specific match
      allMatches.sort((a, b) => 
        ((b.rawComparator?.length || 0) - (a.rawComparator?.length || 0))
      );
      return allMatches[0];
    }

    const matchWithFieldAndComparator = matches.find(m => m.field && m.comparator);
    return matchWithFieldAndComparator || (matches.length > 0 ? matches[0] : undefined);
  }

  /**
   * Parse for valid comparator with an invalid field
   * @returns A match object if found, undefined otherwise
   */
  parseValidComparatorInvalidField(): FilterMatch | undefined {
    const allMatches: FilterMatch[] = [];

    // invalid field, valid comparator
    ALL_COMPARATORS.forEach(c => {
      const compRe = new RegExp(
        `^(.+?)\\s*(${c.nameAndAliases().join('|')})\\s*(.+)`,
      );
      const cMatches = this.query.match(compRe);

      if (cMatches && cMatches.length > 1) {
        const rawField = cMatches[1];
        const rawComparator = cMatches[2];
        const rawValue = cMatches[3];
        const value = cMatches[3];

        // Find a matching field based on raw field
        const matchingField = FIELDS.find(f => {
          return f.nameAndAliases().some(name => rawField.includes(name));
        });

        allMatches.push({
          field: matchingField,
          comparator: c,
          value: value?.trim() || '',
          rawValue: rawValue?.trim() || '',
          rawField: rawField,
          rawComparator: rawComparator,
        });
      }
    });

    if (allMatches.length > 0) {
      allMatches.sort((a, b) => 
        ((b.rawComparator?.length || 0) - (a.rawComparator?.length || 0))
      );
      return allMatches[0];
    }
    
    return undefined;
  }

  /**
   * Parse using default comparator when only field and value are provided
   * @returns A match object if found, undefined otherwise
   */
  parseDefaultComparator(): FilterMatch | undefined {
    const allMatches: FilterMatch[] = [];

    // default comparator check, e.g. power 6, matches luke, pulls cantina
    FIELDS.forEach(f => {
      const fieldRe = new RegExp(`^(${f.nameAndAliases().join('|')})\\s*(.+)`);
      const fMatches = this.query.match(fieldRe);

      if (fMatches && fMatches.length > 0) {
        allMatches.push({
          field: f,
          comparator: f.defaultComparator,
          value: fMatches[2]?.trim() || '',
          rawValue: fMatches[2]?.trim() || '',
          rawField: fMatches[1],
          rawComparator: '',
        });
      }
    });

    return allMatches.length > 0 ? allMatches[0] : undefined;
  }

  /**
   * Check if the filter query is valid
   * @returns True if the filter query is valid
   */
  valid(): boolean {
    return (
      this.validField() &&
      this.validComparator() &&
      this.validValue() &&
      this.validFilter()
    );
  }

  /**
   * Check if the field is valid
   * @returns True if the field is valid
   */
  validField(): boolean {
    return this.field ? FIELDS.some(f => f.name === this.field?.name) : false;
  }

  /**
   * Check if the comparator is valid
   * @returns True if the comparator is valid
   */
  validComparator(): boolean {
    return this.comparator ? ALL_COMPARATORS.some(c => c.name === this.comparator?.name) : false;
  }

  /**
   * Check if the comparator is partially valid (e.g. 'cont' for 'contains')
   * @returns True if the comparator is partially valid
   */
  partiallyValidComparator(): boolean {
    // true when a comparator is partially typed out
    if (!this.rawComparator) {
      return false;
    } else {
      return ALL_COMPARATORS.some(c => c.name.indexOf(this.rawComparator || '') === 0);
    }
  }

  /**
   * Check if using the default comparator
   * @returns True if using the default comparator
   */
  usingDefaultComparator(): boolean {
    return Boolean(this.comparator && this.rawComparator === '');
  }

  /**
   * Check if the value is valid
   * @returns True if the value is valid
   */
  validValue(): boolean {
    return typeof this.value !== 'undefined' && this.value !== null;
  }

  /**
   * Check if the filter is valid
   * @returns True if the filter is valid
   */
  validFilter(): boolean {
    return typeof this.filter !== 'undefined' && this.filter !== null;
  }

  /**
   * Get a display-friendly field name
   * @returns Field name for display
   */
  displayFieldName(): string {
    if (this.field?.name === 'identities') {
      return 'is';
    } else {
      return this.field?.name || this.rawField || this.query;
    }
  }

  /**
   * Get a display-friendly comparator name
   * @returns Comparator name for display
   */
  displayComparatorName(): string | undefined {
    return this.validComparator() ? this.comparator?.name : this.rawComparator;
  }

  /**
   * Execute the filter query on a set of cards
   * @param cards The cards to filter
   * @returns Filtered cards
   */
  execute(cards: Card[]): Card[] {
    if (!this.valid() || !this.value || !this.filter) {
      return [];
    }

    const aliasResolver = new AliasResolver(cards);
    if (this.value) {
      const aliasResolvedValue = aliasResolver.resolve(this.value);
      if (aliasResolvedValue && this.filter) {
        this.value = aliasResolvedValue;
        this.filter.value = aliasResolvedValue;
      }
    }

    const result = this.filter.execute(cards);
    return result.cards as Card[];
  }

  /**
   * Get the number of matching cards
   * @param cards The cards to filter
   * @returns Number of matching cards
   */
  length(cards: Card[]): number {
    return this.execute(cards).length;
  }
}

export default FilterQuery;