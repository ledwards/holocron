class Player {
  name: string;
  aliases: string[];

  constructor(params) {
    this.name = params.name;
    this.aliases = params.aliases;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Player;
