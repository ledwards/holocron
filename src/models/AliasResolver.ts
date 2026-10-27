import Card from '../models/Card';
import ExpansionSet from './ExpansionSet';
import {ValueAliasKind} from './Field';

/** Same normalization Card applies to build sortTitle / sortAbbr. */
const normalize = (value: string): string =>
  value.replaceAll(/[^a-zA-Z0-9 ]/g, '').toLowerCase().trim();

/**
 * Resolves a typed query value that is an ALIAS into the canonical name the
 * data actually stores: a card nickname ("Math Hunter") into the card's title,
 * or a set abbreviation ("P") into the set's name.
 *
 * Resolution is exact-match only. A value that is merely a SUBSTRING of some
 * card's title ("premiere", "dark", "pilot") is not an alias for that card and
 * is returned unchanged; the comparator decides what a substring means.
 */
class AliasResolver {
  cards: Card[];
  sets: ExpansionSet[];

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

    const card = this.cards.find(c =>
      typeof c?.nameAndAliases === 'function' &&
      c.nameAndAliases().some(alias => typeof alias === 'string' && alias === needle),
    );

    return card?.sortTitle || value;
  }

  resolveSet(value: string): string {
    const needle = normalize(value);
    if (!needle) {
      return value;
    }

    const set = this.sets.find(s =>
      typeof s?.nameAndAliases === 'function' &&
      s.nameAndAliases().some(alias => typeof alias === 'string' && normalize(alias) === needle),
    );

    return set?.name || value;
  }
}

export default AliasResolver;
