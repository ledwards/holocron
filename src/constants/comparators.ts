import Card from '../models/Card';
import Comparator from '../models/Comparator';

const EQ_COMPARATOR = new Comparator(
  '=',
  (card: Card, attribute: string, value: string) =>
    card.get(attribute) == parseFloat(value),
  ['==', '===', 'equals', 'eq', 'is', 'is exactly'],
);

const NEQ_COMPARATOR = new Comparator(
  '≠',
  (card: Card, attribute: string, value: string) =>
    card.get(attribute) !== parseFloat(value),
  [
    '!=',
    '=/=',
    '/=',
    'neq',
    'not equal',
    'not equals',
    'not eq',
    'is not',
    'is not exactly',
    'is not equal',
    'is not equals',
    'is not eq',
    'does not equal',
    'does not equals',
    'does not eq',
    'does not exactly equal',
    'does not exactly equals',
    'is not exactly eq',
  ],
);

const GT_COMPARATOR = new Comparator(
  '>',
  (card: Card, attribute: string, value: string) =>
    (card.get(attribute) as number) > parseFloat(value),
  [
    'gt',
    'greater than',
    'more than',
    'over',
    'above',
    'higher than',
    'bigger than',
    'larger than',
    'exceeds',
    'exceed',
    'is greater than',
    'is more than',
    'is over',
    'is above',
    'is higher than',
    'is bigger than',
    'is larger than',
  ],
);

const LT_COMPARATOR = new Comparator(
  '<',
  (card: Card, attribute: string, value: string) =>
    (card.get(attribute) as number) < parseFloat(value),
  [
    'lt',
    'less than',
    'under',
    'below',
    'lower than',
    'smaller than',
    'is less than',
    'is under',
    'is below',
    'is lower than',
    'is smaller than',
  ],
);

const GTE_COMPARATOR = new Comparator(
  '≥',
  (card: Card, attribute: string, value: string) =>
    (card.get(attribute) as number) >= parseFloat(value),
  [
    '>=',
    'gte',
    'greater than or equal',
    'more than or equal',
    'over or equal',
    'above or equal',
    'higher than or equal',
    'bigger than or equal',
    'larger than or equal',
    'exceeds or equal',
    'exceed or equal',
    'is greater than or equal',
    'is more than or equal',
    'is over or equal',
    'is above or equal',
    'is higher than or equal',
    'is bigger than or equal',
    'is larger than or equal',
  ],
);

const LTE_COMPARATOR = new Comparator(
  '≤',
  (card: Card, attribute: string, value: string) =>
    (card.get(attribute) as number) <= parseFloat(value),
  [
    '<=',
    'lte',
    'less than or equal',
    'under or equal',
    'below or equal',
    'lower than or equal',
    'smaller than or equal',
    'is less than or equal',
    'is under or equal',
    'is below or equal',
    'is lower than or equal',
    'is smaller than or equal',
  ],
);

// Text comparison. With `compact`, whitespace is removed from both sides so a
// value typed without the space bar ("badfeeling") finds "bad feeling".
// FilterQuery only asks for that when the exact comparison found nothing.
const squash = (text: string): string => text.replace(/\s+/g, '');
const sanitize = (text: string): string =>
  text.replaceAll(/[^a-zA-Z0-9 -]/g, '').toLowerCase().trim();
// Card text never changes after load, and every keystroke re-reads it.
const TEXT_CACHE = new WeakMap<Card, Map<string, string>>();
const cardText = (card: Card, attribute: string, compact?: boolean): string | undefined => {
  let texts = TEXT_CACHE.get(card);
  const key = compact ? `${attribute}\u0000compact` : attribute;
  const cached = texts?.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const text = card.getSanitized(attribute);
  if (typeof text !== 'string') {
    return text as undefined;
  }
  const result = compact ? squash(text) : text;
  if (!texts) {
    texts = new Map();
    TEXT_CACHE.set(card, texts);
  }
  texts.set(key, result);
  return result;
};
const typedText = (value: string, compact?: boolean): string =>
  compact ? squash(sanitize(value)) : sanitize(value);
const listIncludes = (card: Card, attribute: string, value: string, compact?: boolean) =>
  (card.get(attribute) as string[])
    ?.filter(attr => {
      const item = attr.toLowerCase();
      const needle = value.toLowerCase();
      return compact
        ? squash(item).indexOf(squash(needle)) > -1
        : item.indexOf(needle) > -1;
    }).length;

// STRING
const SUBSTR_COMPARATOR = new Comparator(
  'matches',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    cardText(card, attribute, compact)?.includes(typedText(value, compact)) as boolean,
  [
    'm',
    'contains',
    'has',
    'includes',
    'matches',
    'c',
    'co',
    'con',
    'substr',
    'substring',
  ],
);

const NOT_SUBSTR_COMPARATOR = new Comparator(
  'does not match',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    !cardText(card, attribute, compact)?.includes(typedText(value, compact)),
  [
    'nm',
    'does not contain',
    'does not have',
    'does not include',
    'does not match',
    'nc',
    'nco',
    'ncon',
    'nsubstr',
    'not substring',
  ],
);

const STRING_EQUALS_COMPARATOR = new Comparator(
  '=',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    cardText(card, attribute, compact) == typedText(value, compact),
  ['equals', 'eq', 'exactly', 'is exactly'],
);

const STRING_NOT_EQUALS_COMPARATOR = new Comparator(
  '≠',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    cardText(card, attribute, compact) !== typedText(value, compact),
  ['not equals', 'neq', 'is not', 'is not exactly', `isn't`, `isn't exactly`],
);

// ARRAY
const INCLUDES_COMPARATOR = new Comparator(
  'includes',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    (listIncludes(card, attribute, value, compact) as number) > 0,
  ['c', 'include', 'has', 'contains', 'matches'],
);

const NOT_INCLUDES_COMPARATOR = new Comparator(
  'not includes',
  (card: Card, attribute: string, value: string, compact?: boolean) =>
    listIncludes(card, attribute, value, compact) == 0,
  [
    'nc',
    'not include',
    'not has',
    'not contains',
    'not matches',
    'not includes',
    'not have',
    'not contain',
    'not match',
  ],
);

const NUMERIC_COMPARATORS = [
  EQ_COMPARATOR,
  NEQ_COMPARATOR,
  GT_COMPARATOR,
  LT_COMPARATOR,
  GTE_COMPARATOR,
  LTE_COMPARATOR,
];
const STRING_COMPARATORS = [
  SUBSTR_COMPARATOR,
  NOT_SUBSTR_COMPARATOR,
  STRING_EQUALS_COMPARATOR,
  STRING_NOT_EQUALS_COMPARATOR,
];
const ARRAY_COMPARATORS = [INCLUDES_COMPARATOR, NOT_INCLUDES_COMPARATOR];

const ALL_COMPARATORS =
  NUMERIC_COMPARATORS.concat(STRING_COMPARATORS).concat(ARRAY_COMPARATORS);

export {
  NUMERIC_COMPARATORS,
  STRING_COMPARATORS,
  ARRAY_COMPARATORS,
  ALL_COMPARATORS,
  EQ_COMPARATOR,
  INCLUDES_COMPARATOR,
  STRING_EQUALS_COMPARATOR,
  SUBSTR_COMPARATOR,
};
