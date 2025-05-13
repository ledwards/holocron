class ExpansionSet {
  id: string;
  name: string;
  abbr: string;
  gempName: string;

  constructor(obj: {
    id: string;
    name: string;
    abbr: string;
    gempName: string;
    legacy?: boolean;
  }) {
    this.id = obj.id;
    this.name = obj.name;
    this.abbr = obj.abbr;
    this.gempName = obj.gempName;
  }

  nameAndAliases(): string[] {
    return [this.name, this.gempName, this.abbr];
  }
}

export default ExpansionSet;
