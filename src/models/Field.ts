import Comparator from './Comparator';

class Field {
  name: string;
  comparators: Comparator[];
  aliases: string[];

  constructor(name: string, comparators: Comparator[], aliases: string[] = []) {
    this.name = name;
    this.comparators = comparators;
    this.aliases = aliases;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Field;
