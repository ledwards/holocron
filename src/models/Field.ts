import Comparator from './Comparator';

class Field {
  name: string;
  comparators: Comparator[];
  aliases: string[];
  defaultComparator?: Comparator;

  constructor(
    name: string,
    comparators: Comparator[],
    defaultComparator: Comparator,
    aliases: string[] = [],
  ) {
    this.name = name;
    this.comparators = comparators;
    this.defaultComparator = defaultComparator;
    this.aliases = aliases;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Field;
