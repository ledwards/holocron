import Card from "./Card";
import Field from "./Field";

class Comparator {
  name: string;
  fn: Function; // (card: Card, fieldName: string, value: string) => boolean;
  aliases: string[];

  constructor(name: string, fn: Function, aliases: string[] = []) {
    this.name = name;
    this.fn = fn;
    this.aliases = aliases;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }

  execute(card: Card, field: Field, value: string) {
    let val = false;

    try {
      val = this.fn(card, field?.name, value);
    } catch (e) {
      // This can happen with a type mismatch... ugly way to fix it I guess
    }

    return val;
  }
}

export default Comparator;
