import Card from './Card';
import Field from './Field';
import Filter from './Filter';
import Comparator from './Comparator';
import FIELDS from '../constants/fields';
import {ALL_COMPARATORS} from '../constants/comparators';
import AliasResolver from './AliasResolver';
import {isStatValue} from './StatValue';
import {NUMERIC_COMPARATORS} from '../constants/comparators';

const RUNS_BY_CARDS = new WeakMap<Card[], Map<string, Card[]>>();
const MAX_CACHED_RUNS = 500;

const NUMERIC_FIELD_NAMES = new Set(
  FIELDS.filter(f => f.comparators === NUMERIC_COMPARATORS).map(f => f.name),
);

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
   * @param cards When given, settles a query that reads two ways (see
   *   chooseCandidate). Without cards the parse is data-free.
   */
  constructor(query: string, cards?: Card[]) {
    this.query = query.trim();

    if (this.query) {
      const obj = this.parseQuery(cards);

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
   * Parse the query string into filter components.
   *
   * A clause is FIELD [COMPARATOR] VALUE, with or without spaces between the
   * parts: "set c premiere" and "setcpremiere" parse the same way. The field
   * is the longest field spelling the query starts with, the comparator is
   * looked for only directly after it, and a field typed with no comparator
   * uses its default one.
   * @returns Parameters for constructing a filter
   */
  parseQuery(cards?: Card[]): FilterParams {
    let params: FilterParams = {
      field: null,
      comparator: null,
      value: null,
      rawField: null,
      rawComparator: null,
      rawValue: null,
      query: this.query
    };

    const candidate = this.chooseCandidate(this.parseCandidates(), cards);
    if (candidate) {
      params = {
        ...params,
        field: candidate.field || null,
        comparator: candidate.comparator || null,
        value: candidate.value || null,
        rawField: candidate.rawField || null,
        rawComparator: candidate.rawComparator ?? null,
        rawValue: candidate.rawValue || null,
      };
    } else {
      const partial = this.parsePartialClause() || this.parseValidComparatorInvalidField();
      if (partial) {
        params = {
          ...params,
          field: partial.field || null,
          comparator: partial.comparator || null,
          value: partial.value || null,
          rawField: partial.rawField || null,
          rawComparator: partial.rawComparator || null,
          rawValue: partial.rawValue || null
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
   * Every field the query starts with, longest spelling first. Ties keep
   * FIELDS order: "m" is both maneuver and matching.
   */
  leadingFields(): {field: Field; rawField: string; rest: string}[] {
    const lower = this.query.toLowerCase();
    const leads: {field: Field; rawField: string; rest: string}[] = [];

    FIELDS.forEach(f => {
      const name = f.matchNames().find(n => lower.startsWith(n));
      if (name) {
        leads.push({
          field: f,
          rawField: this.query.slice(0, name.length),
          rest: this.query.slice(name.length).replace(/^\s+/, ''),
        });
      }
    });

    return leads.sort((a, b) => b.rawField.length - a.rawField.length);
  }

  /** The longest field spelling the query starts with, or undefined. */
  leadingField(): {field: Field; rawField: string; rest: string} | undefined {
    return this.leadingFields()[0];
  }

  /**
   * The readings of the first leading field that can read the rest of the
   * clause ("m c falcon": maneuver cannot, matching can).
   */
  parseCandidates(): FilterMatch[] {
    for (const lead of this.leadingFields()) {
      const candidates = this.parseCandidatesFor(lead);
      if (candidates.length) {
        return candidates;
      }
    }
    return [];
  }

  /**
   * Every complete reading of the clause for one field: at most one with an
   * explicit comparator and one with the field's default comparator.
   * "setcpremiere" has both ("set" "c" "premiere", and "set" contains
   * "cpremiere"). "title = vader" has only the first: a symbol, or a word
   * followed by a space, is unambiguously a comparator.
   */
  parseCandidatesFor(lead: {field: Field; rawField: string; rest: string}): FilterMatch[] {
    const {field, rawField, rest} = lead;
    const restLower = rest.toLowerCase();
    const candidates: FilterMatch[] = [];

    let explicit: {comparator: Comparator; alias: string} | undefined;
    field.comparators.forEach(c => {
      const alias = c.matchNames().find(n => restLower.startsWith(n));
      if (alias && (!explicit || alias.length > explicit.alias.length)) {
        explicit = {comparator: c, alias};
      }
    });

    if (explicit) {
      const value = rest.slice(explicit.alias.length).trim();
      if (value && this.valueSuitsField(field, value)) {
        candidates.push({
          field,
          comparator: explicit.comparator,
          value,
          rawValue: value,
          rawField,
          rawComparator: rest.slice(0, explicit.alias.length),
        });
      }
    }

    const afterAlias = explicit ? rest.slice(explicit.alias.length) : '';
    const explicitIsAmbiguous =
      !explicit || (/^[a-z]+$/.test(explicit.alias) && !/^\s/.test(afterAlias));

    const value = rest.trim();
    if (
      explicitIsAmbiguous &&
      field.defaultComparator &&
      value &&
      !this.isPartialComparator(field, restLower) &&
      this.valueSuitsField(field, value)
    ) {
      candidates.push({
        field,
        comparator: field.defaultComparator,
        value,
        rawValue: value,
        rawField,
        rawComparator: '',
      });
    }

    return candidates;
  }

  /**
   * Pick between the explicit-comparator and default-comparator readings.
   *
   * Without cards: the explicit reading, as typed. With cards, prefer the
   * reading that finds cards:
   *   1. a default EQUALITY that finds cards ("rarityc2" is rarity C2, not
   *      "rarity contains 2");
   *   2. a default reading that finds everything the explicit one finds
   *      ("typecharacter" is type contains "character", not "haracter");
   *   3. otherwise the explicit reading if it finds cards ("setcpremiere");
   *   4. otherwise the default reading if it finds cards.
   */
  chooseCandidate(candidates: FilterMatch[], cards?: Card[]): FilterMatch | undefined {
    const explicit = candidates.find(c => c.rawComparator !== '');
    const fallback = candidates.find(c => c.rawComparator === '');

    if (!cards || !explicit || !fallback) {
      return explicit || fallback;
    }

    const explicitIds = new Set(FilterQuery.run(explicit, cards).map(c => c.id));
    const fallbackFound = FilterQuery.run(fallback, cards);
    const fallbackIds = new Set(fallbackFound.map(c => c.id));
    const isEquality = fallback.comparator?.name === '=';

    if (fallbackFound.length && isEquality) {
      return fallback;
    }
    if (fallbackFound.length && [...explicitIds].every(id => fallbackIds.has(id))) {
      return fallback;
    }
    if (explicitIds.size) {
      return explicit;
    }
    return fallbackFound.length ? fallback : explicit;
  }

  /**
   * A field followed only by the start of a comparator ("power gr"): keep
   * the field and show the comparator as partly typed.
   */
  parsePartialClause(): FilterMatch | undefined {
    const lead = this.leadingField();
    if (!lead) {
      return undefined;
    }
    return {
      field: lead.field,
      rawField: lead.rawField,
      rawComparator: lead.rest.trim(),
    };
  }

  /** "gr" while typing "greater than" — but not "c", which is complete. */
  isPartialComparator(field: Field, text: string): boolean {
    const names = field.comparators.flatMap(c => c.matchNames());
    return !names.includes(text) && names.some(n => n.length > text.length && n.startsWith(text));
  }

  /**
   * Numeric fields take stat values: numbers, "½", "pi", or a symbol that
   * occurs on cards ("*", "x"). "po=3" is not power = "o=3".
   */
  valueSuitsField(field: Field, value: string): boolean {
    return !NUMERIC_FIELD_NAMES.has(field.name) || isStatValue(value);
  }

  /**
   * Run one reading against the cards: alias resolution, the exact match,
   * and, when the exact match finds nothing and the value has no spaces, the
   * ignore-spaces match. A query that already finds cards is never widened.
   */
  static run(match: FilterMatch, cards: Card[]): Card[] {
    if (!match.field || !match.comparator || !match.value) {
      return [];
    }

    // One keystroke asks the same question several times (reading choice,
    // "and" splitting, results, status-bar counts), and the next keystroke
    // asks most of them again. Card lists are replaced, never mutated.
    let runs = RUNS_BY_CARDS.get(cards);
    if (!runs) {
      runs = new Map();
      RUNS_BY_CARDS.set(cards, runs);
    }
    // A field has one comparator per name, so field + comparator + value is unique.
    const key = `${match.field.name}\u0000${match.comparator.name}\u0000${match.value}`;
    const cached = runs.get(key);
    if (cached) {
      return cached;
    }
    if (runs.size >= MAX_CACHED_RUNS) {
      runs.clear();
    }
    const found = FilterQuery.runUncached(match, cards);
    runs.set(key, found);
    return found;
  }

  static runUncached(match: FilterMatch, cards: Card[]): Card[] {
    if (!match.field || !match.comparator || !match.value) {
      return [];
    }

    const kind = match.field.valueAlias;
    const value = kind ? AliasResolver.for(cards).resolve(match.value, kind) : match.value;
    const filter = new Filter(match.field, match.comparator, value);
    const exact = filter.execute(cards).cards as Card[];

    if (exact.length || /\s/.test(value)) {
      return exact;
    }
    return filter.execute(cards, true).cards as Card[];
  }

  /**
   * Parse for valid comparator with an invalid field, so the status bar can
   * show which part is wrong ("colour = red": red field, green comparator).
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

        // The text before the comparator is not a field (parseCandidates
        // would have found it). Never guess one from a fragment: "colour"
        // contains "l", the lore alias. The status bar shows it as invalid.
        allMatches.push({
          field: undefined,
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
      const typed = this.rawComparator.toLowerCase();
      return ALL_COMPARATORS.some(c => c.matchNames().some(n => n.indexOf(typed) === 0));
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
    if (!this.valid() || !this.value || !this.filter || !this.field || !this.comparator) {
      return [];
    }

    return FilterQuery.run(this, cards);
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
