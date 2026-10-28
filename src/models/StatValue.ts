import Card from './Card';

/**
 * A card stat as upstream writes it, read into numbers.
 *
 * Upstream stats are text: usually "6", but also "½", "4½", "π", "(4)",
 * "1 or 6", "π or 2π", and the non-numeric symbols "*", "X", "Y", "IV".
 * `numbers` holds every value the stat can take; `symbol` holds a stat that
 * is not a number at all ("*"), lowercased. Typed query values go through
 * the same parser, so "pi" and "4.5" mean what the card text means.
 */
export interface Stat {
  numbers: number[];
  symbol: string | undefined;
}

/** Non-numeric stats that occur upstream. Anything else typed is a typo. */
export const STAT_SYMBOLS = new Set(['*', 'x', 'y', 'iv']);

const parseNumber = (text: string): number | undefined => {
  const inner = text.replace(/^\((.*)\)$/, '$1').trim();
  if (/^-?\d+(\.\d+)?$/.test(inner)) {
    return Number(inner);
  }
  const half = inner.match(/^(\d*)½$/);
  if (half) {
    return (half[1] ? Number(half[1]) : 0) + 0.5;
  }
  const pi = inner.match(/^(\d*)(π|pi)$/);
  if (pi) {
    return (pi[1] ? Number(pi[1]) : 1) * Math.PI;
  }
  return undefined;
};

export const parseStat = (raw: unknown): Stat | undefined => {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const text = String(raw).trim().toLowerCase();
  if (!text) {
    return undefined;
  }
  const parts = text.split(/\s+or\s+/);
  const numbers = parts.map(parseNumber).filter((n): n is number => n !== undefined);
  const symbol = parts.length === 1 && numbers.length === 0 ? text : undefined;
  return {numbers, symbol};
};

/** A value typed for a numeric field: a number, pi, a fraction or a known symbol. */
export const isStatValue = (typed: string): boolean => {
  const stat = parseStat(typed);
  return !!stat && (stat.numbers.length > 0 || STAT_SYMBOLS.has(stat.symbol || ''));
};

const STATS = new WeakMap<Card, Map<string, Stat | undefined>>();

/** The card's stat, parsed once per card (card text never changes after load). */
export const statOf = (card: Card, attribute: string): Stat | undefined => {
  let stats = STATS.get(card);
  if (!stats) {
    stats = new Map();
    STATS.set(card, stats);
  }
  if (!stats.has(attribute)) {
    stats.set(attribute, parseStat(card.get(attribute)));
  }
  return stats.get(attribute);
};
