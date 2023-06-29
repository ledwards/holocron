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

  execute(card: Card, field: Field, value: string) {
    return this.fn(card, field.name, value);
  }
}

export default Comparator;
