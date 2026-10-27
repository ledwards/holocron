import Card from './Card';
import Field, {withCompactSpellings} from './Field';

class Comparator {
  name: string;
  fn: (card: Card, fieldName: string, value: string, compact?: boolean) => boolean;
  aliases: string[]; // comparator aliases e.g. "eq" is the same as "="

  constructor(name: string, fn: (card: Card, fieldName: string, value: string, compact?: boolean) => boolean, aliases: string[] = []) {
    this.name = name;
    this.fn = fn;
    this.aliases = aliases;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }

  /** Name and aliases plus their space-free spellings ("doesnotcontain"), longest first. */
  matchNames(): string[] {
    return withCompactSpellings(this.nameAndAliases());
  }

  /**
   * @param compact compare text with whitespace removed from the card's side
   * too, so "badfeeling" finds "bad feeling". Numeric comparators ignore it.
   */
  execute(card: Card, field: Field, value: string, compact = false) {
    let val = false;

    try {
      val = this.fn(card, field?.name, value, compact);
    } catch (e) {
      console.log(e);
      // This can happen with a type mismatch... ugly way to fix it I guess
    }

    return val;
  }
}

export default Comparator;
