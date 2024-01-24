class Tournament {
  name: string;
  shortName: string;
  eventName: string;
  date: Date;
  url: string;
  slug: string;

  constructor(params) {
    this.url = params.url;
    this.slug = params.slug;
    this.name = params.name;
    this.shortName = params.shortName;
    this.eventName = params.eventName;
    this.date = params.date;
  }

  nameAndAliases() {
    return [this.name].concat(this.aliases).sort((a, b) => b.length - a.length);
  }
}

export default Tournament;
