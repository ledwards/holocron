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
}

export default Field;
