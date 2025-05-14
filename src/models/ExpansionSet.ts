import { ExpansionSetJSON } from '../types/interfaces';

class ExpansionSet {
  id: string;
  name: string;
  abbr: string;
  gempName: string;

  constructor(obj: ExpansionSetJSON) {
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
