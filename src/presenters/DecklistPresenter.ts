import Decklist from '../models/Decklist';

class DecklistPresenter {
  slug: string;
  title: string;
  date: string; // TODO: Date object
  url: string;
  side: string;
  tournamentRound: string;

  imageUrl: string;
  plaintext: string;

  searchTitle: string;
  searchArchetypeName: string;
  searchTournamentName: string;
  

  searchPlayerName: string;

  displayTitle: string;
  displaySubtitle: string;

  offsetY: number;
  offsetHeight: number;
  aspectRatio: number;
  height: number;
  width: number;
  sideways: boolean;

  hasObjective: boolean;
  hasStartingSite: boolean;

  cards: Record<string, number>; // TODO: DecklistCard[] or pass in allCards and make these Card objects

  constructor(decklist: Decklist) {
    this.slug = decklist.slug;
    this.url = decklist.url;
    this.date = decklist.date;
    this.title = decklist.title;
    this.side = decklist.side;
    this.side = decklist.side;
    this.tournamentRound = decklist.tournamentRound;
    this.imageUrl = decklist.imageUrl;
    this.plaintext = decklist.plaintext;

    this.displayTitle = decklist.archetype.name;
    this.displaySubtitle =
      `${decklist.tournament.name} ${decklist.tournamentRound || ''}`.trim() +
      '\r\n' +
      [decklist.player.name, decklist.date].filter(x => x).join(' • ');

    this.sideways = !!decklist.objective;

    this.searchTitle = decklist.title;
    this.searchPlayerName = decklist.player.nameAndAliases().join(' ');
    this.searchArchetypeName = decklist.archetype.nameAndAliases().join(' ');
    this.searchTournamentName = `${decklist.tournament} ${decklist.tournamentRound} ${decklist.tournamentFormat}`;

    this.hasObjective = decklist.objective ? true : false;

    this.hasStartingSite =
      decklist.startingLocation && decklist.startingLocation.includes(':')
        ? true
        : false;

    this.height = this.sideways ? 339 : 475;
    this.width = this.sideways ? 475 : 339;
    this.aspectRatio = this.height / this.width;

    if (this.hasStartingSite) {
      this.offsetY = -30;
      this.offsetHeight = 30;
    } else if (this.hasObjective) {
      this.offsetY = 0;
      this.offsetHeight = 0;
    } else {
      this.offsetY = 0;
      this.offsetHeight = 0;
    }

    this.cards = decklist.cards;
  }
}

export default DecklistPresenter;
