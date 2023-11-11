class ExpansionSet {
  id: string;
  name: string;
  abbr: string;

  constructor(obj: any) {
    this.id = obj.id;
    this.name = obj.name;
    this.abbr = obj.abbr;
  }
}

export default ExpansionSet;
