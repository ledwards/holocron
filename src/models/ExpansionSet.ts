class ExpansionSet {
  id: string;
  name: string;
  abbr: string;
  gempName: string;

  constructor(obj: any) {
    this.id = obj.id;
    this.name = obj.name;
    this.abbr = obj.abbr;
    this.gempName = obj.gempName;
  }

  nameAndAliases() {
    return [this.name, this.gempName, this.abbr];
  }
}

export default ExpansionSet;
