import Card from './Card';
import Filter from './Filter';

// NUMERIC
const EQ_COMPARATOR = { '=': (card: Card, attribute: string, value: string) => card.get(attribute) == parseFloat(value) };
const NEQ_COMPARATOR = { '≠': (card: Card, attribute: string, value: string) => card.get(attribute) !== parseFloat(value) };
const GT_COMPARATOR = { '>': (card: Card, attribute: string, value: string) => card.get(attribute) > parseFloat(value) };
const LT_COMPARATOR = { '<': (card: Card, attribute: string, value: string) => card.get(attribute) < parseFloat(value) };
const GTE_COMPARATOR = { '≥': (card: Card, attribute: string, value: string) => card.get(attribute) >= parseFloat(value) };
const LTE_COMPARATOR = { '≤': (card: Card, attribute: string, value: string) => card.get(attribute) <= parseFloat(value) };

// STRING
const SUBSTR_COMPARATOR = { 'matches': (card: Card, attribute: string, value: string) => card.get(attribute)?.toLowerCase().includes(value.toLowerCase()) };
const NOT_SUBSTR_COMPARATOR = { 'does not match': (card: Card, attribute: string, value: string) => !card.get(attribute)?.toLowerCase().includes(value.toLowerCase()) };

// ARRAY
const INCLUDES_COMPARATOR = { 'include': (card: Card, attribute: string, value: string) => card.get(attribute)?.map(a => a.toLowerCase()).indexOf(value.toLowerCase()) > -1 };
const NOT_INCLUDES_COMPARATOR = { 'do not include': (card: Card, attribute: string, value: string) => !(card.get(attribute)?.map(a => a.toLowerCase()).indexOf(value.toLowerCase()) > -1) };

// ARRAY_OR_STRING
const CONTAINS_COMPARATOR = {
  'contains': (card: Card, attribute: string, value: string) => {
    let attr = card.get(attribute);
    if (typeof (attr) === 'string') {
      attr = attr.toLowerCase();
    } else if (Array.isArray(value)) {
      attr = attr.map(a => a.toLowerCase()).join(' ');
    }
    return attr?.includes(value.toLowerCase());
  }
};

const NOT_CONTAINS_COMPARATOR = {
  'does not contain': (card: Card, attribute: string, value: string) => {
    let attr = card.get(attribute);
    if (typeof (attr) === 'string') {
      attr = attr.toLowerCase();
    } else if (Array.isArray(value)) {
      attr = attr.map(a => a.toLowerCase()).join(' ');
    }
    return !attr?.includes(value.toLowerCase());
  }
};

// GROUPINGS
const NUMERIC_COMPARATORS = { ...EQ_COMPARATOR, ...NEQ_COMPARATOR, ...GT_COMPARATOR, ...LT_COMPARATOR, ...GTE_COMPARATOR, ...LTE_COMPARATOR };
const STRING_COMPARATORS = { ...SUBSTR_COMPARATOR, ...NOT_SUBSTR_COMPARATOR };
const ARRAY_COMPARATORS = { ...INCLUDES_COMPARATOR, ...NOT_INCLUDES_COMPARATOR };
const ARRAY_OR_STRING_COMPARATORS = { ...CONTAINS_COMPARATOR, ...NOT_CONTAINS_COMPARATOR };

const COMPARATOR_ALIAS_MAPPINGS = {
  '=': '=',
  '==': '=',
  '===': '=',
  ' equals': '=',
  ' eq ': '=',
  ' is ': '=',
  ' is exactly': '=',

  '!=': '≠',
  '=/=': '≠',
  '/=': '≠',
  ' neq ': '≠',
  ' not equal': '≠',
  ' not equals': '≠',
  ' not eq': '≠',
  ' is not': '≠',
  ' is not exactly': '≠',
  ' is not equal': '≠',
  ' is not equals': '≠',
  ' is not eq': '≠',
  ' does not equal': '≠',
  ' does not equals': '≠',
  ' does not eq': '≠',
  ' does not exactly equal': '≠',
  ' does not exactly equals': '≠',
  ' is not exactly eq': '≠',

  '>': '>',
  ' gt ': '>',
  ' greater than': '>',
  ' more than': '>',
  ' over': '>',
  ' above': '>',
  ' higher than': '>',
  ' bigger than': '>',
  ' larger than': '>',
  ' exceeds': '>',
  ' exceed': '>',
  ' is greater than': '>',
  ' is more than': '>',
  ' is over': '>',
  ' is above': '>',
  ' is higher than': '>',
  ' is bigger than': '>',
  ' is larger than': '>',

  '<': '<',
  ' lt ': '<',
  ' less than': '<',
  ' under': '<',
  ' below': '<',
  ' lower than': '<',
  ' smaller than': '<',
  ' fewer than': '<',
  ' is less than': '<',
  ' is under': '<',
  ' is below': '<',
  ' is lower than': '<',
  ' is smaller than': '<',
  ' is fewer than': '<',

  '≥': '≥',
  '>=': '≥',
  ' gte ': '≥',
  ' ge ': '≥',
  ' is greater than or equal to': '≥',
  ' is greater than or equal': '≥',
  ' is greater or equal to': '≥',
  ' is greater or equal': '≥',
  ' is at least': '≥',
  ' is no less than': '≥',
  ' is not less than': '≥',
  ' is not smaller than': '≥',
  ' is not fewer than': '≥',
  ' is not under': '≥',
  ' is not below': '≥',
  ' is not lower than': '≥',
  ' is not lower': '≥',
  ' is not smaller': '≥',
  ' is not fewer': '≥',

  '≤': '≤',
  '<=': '≤',
  ' lte ': '≤',
  ' le ': '≤',
  ' is less than or equal to': '≤',
  ' is less than or equal': '≤',
  ' is less or equal to': '≤',
  ' is less or equal': '≤',
  ' is at most': '≤',
  ' is no more than': '≤',
  ' is not greater than': '≤',
  ' is not bigger than': '≤',
  ' is not larger than': '≤',
  ' is not above': '≤',
  ' is not higher than': '≤',
  ' is not higher': '≤',
  ' is not bigger': '≤',
  ' is not larger': '≤',
  ' is not more': '≤',
  ' is not over': '≤',
  ' does not exceed': '≤',

  ' contains': 'contains',
  ' contain': 'contains',
  ' includes': 'contains',
  ' include': 'contains',
  ' matches': 'contains',
  ' match': 'contains',
  ' has': 'contains',
  ' have': 'contains',

  ' does not contain': 'does not contain',
  ' do not contain': 'does not contain',
  ' does not include': 'does not contain',
  ' do not include': 'does not contain',
  ' does not match': 'does not contain',
  ' do not match': 'does not contain',
  ' does not have': 'does not contain',
  ' do not have': 'does not contain',
}

const fieldMapToFilters = {
  'ability': new Filter('ability', NUMERIC_COMPARATORS),
  'armor': new Filter('armor', NUMERIC_COMPARATORS),
  'darkSideIcons': new Filter('darkSideIcons', NUMERIC_COMPARATORS),
  'deploy': new Filter('deploy', NUMERIC_COMPARATORS),
  'destiny': new Filter('destiny', NUMERIC_COMPARATORS),
  'ferocity': new Filter('ferocity', NUMERIC_COMPARATORS),
  'forfeit': new Filter('forfeit', NUMERIC_COMPARATORS),
  'hyperspeed': new Filter('hyperspeed', NUMERIC_COMPARATORS),
  'landspeed': new Filter('landspeed', NUMERIC_COMPARATORS),
  'lightSideIcons': new Filter('lightSideIcons', NUMERIC_COMPARATORS),
  'maneuver': new Filter('maneuver', NUMERIC_COMPARATORS),
  'parsec': new Filter('parsec', NUMERIC_COMPARATORS),
  'politics': new Filter('politics', NUMERIC_COMPARATORS),
  'power': new Filter('power', NUMERIC_COMPARATORS),

  'extraText': new Filter('extraText', STRING_COMPARATORS), // ?
  'gametext': new Filter('gametext', ARRAY_OR_STRING_COMPARATORS),
  'lore': new Filter('lore', ARRAY_OR_STRING_COMPARATORS),
  'title': new Filter('title', ARRAY_OR_STRING_COMPARATORS),
  'type': new Filter('type', STRING_COMPARATORS), // ENUM?

  'characteristics': new Filter('characteristics', ARRAY_OR_STRING_COMPARATORS),
  'icons': new Filter('icons', ARRAY_OR_STRING_COMPARATORS),
  'rarity': new Filter('rarity', STRING_COMPARATORS), // ENUM?
  'set': new Filter('set', STRING_COMPARATORS), // ENUM?
  'side': new Filter('side', STRING_COMPARATORS), // ENUM?
  'subType': new Filter('subType', STRING_COMPARATORS), // ENUM?
  'uniqueness': new Filter('uniqueness', STRING_COMPARATORS), // ENUM?
};

class FilterQuery {
  query: string;
  field: string;
  value: string;
  comparator: string;
  filter: Filter;

  // oldconstructor(query: string) {
  //   this.query = query;
  //   this.field = query.split(" ")[0];
  //   this.value = query.split(" ")[query.split(" ").length - 1];

  //   const userEnteredComparator = query.replace(this.field, '').replace(this.value, '').trim();
  //   this.comparator = (COMPARATOR_ALIASES as any)[userEnteredComparator] || userEnteredComparator;
  //   this.filter = (fieldMapToFilters as any)[this.field];
  // }

  constructor(query: string) {
    this.query = query.trim();
    const foundComparator = this.findComparator();
    this.comparator = (COMPARATOR_ALIAS_MAPPINGS as any)[foundComparator] || foundComparator;
    this.field = query.split(foundComparator)[0]?.trim(); // TODO: what if null e.g. 'is imperial'
    this.value = query.split(foundComparator)[1]?.trim(); // TODO: what if comparator is substring of value, should just split first instance of comparator

    this.filter = (fieldMapToFilters as any)[this.field];
  }

  findComparator() {
    const foundList = Object.keys(COMPARATOR_ALIAS_MAPPINGS).filter((comparator: any) => this.query.includes(comparator));
    return foundList.sort(function(a, b) {
      // ASC -> a.length - b.length
      // DESC -> b.length - a.length
      return b.length - a.length;
    })[0];
  }

  valid() {
    return this.field && this.comparator && this.value && this.filter && Object.keys(this.filter.comparators).includes(this.comparator);
  }

  validField() {
    return Object.keys(fieldMapToFilters).includes(this.field);
  }

  validComparator() { }
  validValue() { }

  select(cards: Card[]) {
    if (!this.valid()) {
      return cards;
    }
    return this.filter.select(cards, this.comparator, this.value);
  }
}

export default FilterQuery;
