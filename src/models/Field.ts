import Comparator from './Comparator';

/**
 * What kind of alias a field's VALUE may be written as. A `card` field holds
 * card titles, so "Math Hunter" may stand for "Hayes Hunter"; a `set` field
 * holds expansion set names, so "P" may stand for "Premiere". Fields without
 * an alias kind (type, side, icons, numbers, free text) take the value as
 * typed — nothing is allowed to rewrite it.
 */
export type ValueAliasKind = 'card' | 'set';

class Field {
  name: string;
  comparators: Comparator[];
  aliases: string[];
  defaultComparator?: Comparator;
  valueAlias?: ValueAliasKind;

  constructor(
    name: string,
    comparators: Comparator[],
    defaultComparator: Comparator,
    aliases: string[] = [],
    valueAlias?: ValueAliasKind,
  ) {
    this.name = name;
    this.comparators = comparators;
    this.defaultComparator = defaultComparator;
    this.aliases = aliases;
    this.valueAlias = valueAlias;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Field;
