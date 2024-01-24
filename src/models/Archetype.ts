class Archetype {
  name: string;
  shortName: string;
  side: string;
  aliases: string[];
  modifiers: string[];

  constructor(params) {
    this.name = params.name;
    this.shortName = params.shortName;
    this.side = params.side;
    this.aliases = params.aliases;
    this.modifiers = params.modifiers;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Archetype;
