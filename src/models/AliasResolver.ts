import Card from '../models/Card';
import ExpansionSet from './ExpansionSet';
import {ValueAliasKind} from './Field';

/** Same normalization Card applies to build sortTitle / sortAbbr. */
const normalize = (value: string): string =>
  value.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase().trim();

/**
 * Exact alias match. A value typed without spaces ("mathhunter") also matches
 * the alias with its spaces removed; a value typed WITH spaces must match as
 * typed.
 */
const sameAlias = (alias: string, needle: string): boolean =>
  alias === needle || (!/\s/.test(needle) && alias.replace(/\s+/g, '') === needle);

/**
 * Resolves a typed query value that is an ALIAS into the canonical name the
 * data actually stores: a card nickname ("Math Hunter") into the card's title,
 * or a set abbreviation ("P") into the set's name.
 *
 * Resolution is exact-match only. A value that is merely a SUBSTRING of some
 * card's title ("premiere", "dark", "pilot") is not an alias for that card and
 * is returned unchanged; the comparator decides what a substring means.
 */
const RESOLVERS = new WeakMap<Card[], AliasResolver>();

class AliasResolver {
  cards: Card[];
  sets: ExpansionSet[];
  private cardTitleByAlias?: Map<string, string>;
  private cardTitleByCompactAlias?: Map<string, string>;

  /** The resolver for a card list, built once; card lists are never mutated. */
  static for(cards: Card[]): AliasResolver {
    let resolver = RESOLVERS.get(cards);
    if (!resolver) {
      resolver = new AliasResolver(cards);
      RESOLVERS.set(cards, resolver);
    }
    return resolver;
  }

  constructor(cards: Card[]) {
    this.cards = cards;

    const setsById = new Map<string, ExpansionSet>();
    cards.forEach(card => {
      if (card.expansionSet && !setsById.has(card.expansionSet.id)) {
        setsById.set(card.expansionSet.id, card.expansionSet);
      }
    });
    this.sets = [...setsById.values()];
  }

  resolve(value: string, kind?: ValueAliasKind): string {
    switch (kind) {
      case 'card':
        return this.resolveCard(value);
      case 'set':
        return this.resolveSet(value);
      default:
        return value;
    }
  }

  resolveCard(value: string): string {
    const needle = normalize(value);
    if (!needle) {
      return value;
    }

    const {exact, compact} = this.cardAliasIndex();
    return exact.get(needle) || (!/\s/.test(needle) && compact.get(needle)) || value;
  }

  /** alias -> sortTitle of the FIRST card (in list order) carrying it. */
  private cardAliasIndex(): {exact: Map<string, string>; compact: Map<string, string>} {
    if (!this.cardTitleByAlias || !this.cardTitleByCompactAlias) {
      const exact = new Map<string, string>();
      const compact = new Map<string, string>();
      this.cards.forEach(c => {
        if (typeof c?.nameAndAliases !== 'function' || !c.sortTitle) {
          return;
        }
        c.nameAndAliases().forEach(alias => {
          if (typeof alias !== 'string' || !alias) {
            return;
          }
          if (!exact.has(alias)) {
            exact.set(alias, c.sortTitle);
          }
          const squashed = alias.replace(/\s+/g, '');
          if (!compact.has(squashed)) {
            compact.set(squashed, c.sortTitle);
          }
        });
      });
      this.cardTitleByAlias = exact;
      this.cardTitleByCompactAlias = compact;
    }
    return {exact: this.cardTitleByAlias, compact: this.cardTitleByCompactAlias};
  }

  resolveSet(value: string): string {
    const needle = normalize(value);
    if (!needle) {
      return value;
    }

    const set = this.sets.find(s =>
      typeof s?.nameAndAliases === 'function' &&
      s.nameAndAliases().some(alias => typeof alias === 'string' && sameAlias(normalize(alias), needle)),
    );

    return set?.name || value;
  }
}

export default AliasResolver;
