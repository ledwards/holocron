import Card from '../models/Card';
import Comparator from '../models/Comparator';

// NUMERIC
// TODO: first two are 'numeric or enum'?
const EQ_COMPARATOR = new Comparator(
  '=',
  (card: Card, attribute: string, value: string) => card.get(attribute) == parseFloat(value),
  ['==', '===', 'equals', 'eq', 'is', 'is exactly']
);

const NEQ_COMPARATOR = new Comparator(
  '≠',
  (card: Card, attribute: string, value: string) => card.get(attribute) !== parseFloat(value),
  ['!=', '=/=', '/=', 'neq', 'not equal', 'not equals', 'not eq', 'is not', 'is not exactly', 'is not equal', 'is not equals', 'is not eq', 'does not equal', 'does not equals', 'does not eq', 'does not exactly equal', 'does not exactly equals', 'is not exactly eq']
);

const GT_COMPARATOR = new Comparator(
  '>',
  (card: Card, attribute: string, value: string) => card.get(attribute) > parseFloat(value),
  ['gt', 'greater than', 'more than', 'over', 'above', 'higher than', 'bigger than', 'larger than', 'exceeds', 'exceed', 'is greater than', 'is more than', 'is over', 'is above', 'is higher than', 'is bigger than', 'is larger than']
);

const LT_COMPARATOR = new Comparator(
  '<',
  (card: Card, attribute: string, value: string) => card.get(attribute) < parseFloat(value),
  ['lt', 'less than', 'under', 'below', 'lower than', 'smaller than', 'is less than', 'is under', 'is below', 'is lower than', 'is smaller than']
);

const GTE_COMPARATOR = new Comparator(
  '≥',
  (card: Card, attribute: string, value: string) => card.get(attribute) >= parseFloat(value),
  ['>=', 'gte', 'greater than or equal', 'more than or equal', 'over or equal', 'above or equal', 'higher than or equal', 'bigger than or equal', 'larger than or equal', 'exceeds or equal', 'exceed or equal', 'is greater than or equal', 'is more than or equal', 'is over or equal', 'is above or equal', 'is higher than or equal', 'is bigger than or equal', 'is larger than or equal']
);

const LTE_COMPARATOR = new Comparator(
  '≤',
  (card: Card, attribute: string, value: string) => card.get(attribute) <= parseFloat(value),
  ['<=', 'lte', 'less than or equal', 'under or equal', 'below or equal', 'lower than or equal', 'smaller than or equal', 'is less than or equal', 'is under or equal', 'is below or equal', 'is lower than or equal', 'is smaller than or equal']
);

// STRING
const SUBSTR_COMPARATOR = new Comparator(
  'matches',
  (card: Card, attribute: string, value: string) => card.get(attribute)?.toLowerCase().includes(value.toLowerCase()),
  ['contains', 'has', 'includes', 'matches', 'is', 'is exactly']
);

const NOT_SUBSTR_COMPARATOR = new Comparator(
  'does not match',
  (card: Card, attribute: string, value: string) => !card.get(attribute)?.toLowerCase().includes(value.toLowerCase()),
  ['does not contain', 'does not have', 'does not include', 'does not match', 'is not', 'is not exactly']
);


// ARRAY
const INCLUDES_COMPARATOR = new Comparator(
  'includes',
  (card: Card, attribute: string, value: string) => card.get(attribute)?.map(a => a.toLowerCase()).includes(value.toLowerCase()),
  ['include', 'has', 'contains', 'matches', 'is', 'is exactly']
);

const NOT_INCLUDES_COMPARATOR = new Comparator(
  'does not include',
  (card: Card, attribute: string, value: string) => !card.get(attribute)?.map(a => a.toLowerCase()).includes(value.toLowerCase()),
  ['do not include', 'does not have', 'does not contain', 'does not match', 'is not', 'is not exactly']
);


// ARRAY_OR_STRING
// may not be necessary anymore?
const CONTAINS_COMPARATOR = new Comparator(
  'contains',
  (card: Card, attribute: string, value: string) => {
    let attr = card.get(attribute);
    if (typeof (attr) === 'string') {
      attr = attr.toLowerCase();
    } else if (Array.isArray(attr)) {
      attr = attr.map(a => a.toLowerCase()).join(' ');
    }
    return attr?.includes(value.toLowerCase());
  },
  ['contain', 'include', 'includes', 'has', 'have'],
);

const NOT_CONTAINS_COMPARATOR = new Comparator(
  'does not contain',
  (card: Card, attribute: string, value: string) => {
    let attr = card.get(attribute);
    if (typeof (attr) === 'string') {
      attr = attr.toLowerCase();
    } else if (Array.isArray(attr)) {
      attr = attr.map(a => a.toLowerCase()).join(' ');
    }
    return !attr?.includes(value.toLowerCase());
  },
  ['do not contain', 'do not include', 'does not include', 'do not have', 'does not have'],

);

// const NUMERIC_COMPARATORS = { ...EQ_COMPARATOR, ...NEQ_COMPARATOR, ...GT_COMPARATOR, ...LT_COMPARATOR, ...GTE_COMPARATOR, ...LTE_COMPARATOR };
// const STRING_COMPARATORS = { ...SUBSTR_COMPARATOR, ...NOT_SUBSTR_COMPARATOR };
// const ARRAY_COMPARATORS = { ...INCLUDES_COMPARATOR, ...NOT_INCLUDES_COMPARATOR };
// const ARRAY_OR_STRING_COMPARATORS = { ...CONTAINS_COMPARATOR, ...NOT_CONTAINS_COMPARATOR };

const NUMERIC_COMPARATORS = [EQ_COMPARATOR, NEQ_COMPARATOR, GT_COMPARATOR, LT_COMPARATOR, GTE_COMPARATOR, LTE_COMPARATOR];
const STRING_COMPARATORS = [SUBSTR_COMPARATOR, NOT_SUBSTR_COMPARATOR];
const ARRAY_COMPARATORS = [INCLUDES_COMPARATOR, NOT_INCLUDES_COMPARATOR];
const ARRAY_OR_STRING_COMPARATORS = [CONTAINS_COMPARATOR, NOT_CONTAINS_COMPARATOR];

export {
  NUMERIC_COMPARATORS,
  STRING_COMPARATORS,
  ARRAY_COMPARATORS,
  ARRAY_OR_STRING_COMPARATORS,
}
