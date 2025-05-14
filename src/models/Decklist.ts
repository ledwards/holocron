import Tournament from './Tournament';
import Archetype from './Archetype';
import Player from './Player';
import { DecklistCard } from '../types/interfaces';

// TODO: searchData() should be an attribute to avoid:
//  WARN  Non-serializable values were found in the navigation state. Check:
// Decklists > Tournament Decklists > params.allDecklists[0].searchData (Function)

class Decklist {
  id: string;
  title: string;
  slug: string;
  url: string;
  date: string; // TODO: Date
  side: string;
  plaintext: string;
  cards: Record<string, number>; // Will be refactored to use DecklistCard[] in future
  tournament: Tournament;
  tournamentFormat: string;
  tournamentRound: string;
  archetype: Archetype;
  player: Player;
  imageUrl: string;
  objective: string;
  startingLocation: string | null;
  startingInterrupt: string | null;

  constructor(decklistJSON: {
    slug: string;
    region?: string;
    title: string;
    url: string;
    date: string;
    side: string;
    plaintext: string;
    cards: Record<string, number>;
    tournament?: {
      name: string;
      shortName: string;
      eventName: string;
      date: string;
      format: string;
      round: string;
    };
    archetype: {
      name: string;
      shortName: string;
      aliases: string[];
      modifiers: string[];
      imageUrl: string;
      objective?: string;
      startingLocation?: string;
      startingInterrupt?: string;
    };
    player: {
      name: string;
      aliases: string[];
    };
  }) {
    this.id =
      decklistJSON.slug + decklistJSON.region ? `-${decklistJSON.region}` : '';
    this.title = decklistJSON.title;
    this.slug = decklistJSON.slug;
    this.url = decklistJSON.url;
    this.date = decklistJSON.date;
    this.side = decklistJSON.side;
    this.plaintext = decklistJSON.plaintext;
    this.imageUrl = decklistJSON.archetype.imageUrl;

    this.tournament = new Tournament({
      name: decklistJSON.tournament?.name,
      shortName: decklistJSON.tournament?.shortName,
      eventName: decklistJSON.tournament?.eventName,
      date: decklistJSON.tournament?.date, // TODO: parse dates
    });

    this.tournamentFormat = decklistJSON.tournament?.format;
    this.tournamentRound = decklistJSON.tournament?.round;

    this.archetype = new Archetype({
      name: decklistJSON.archetype.name,
      shortName: decklistJSON.archetype.shortName,
      aliases: decklistJSON.archetype.aliases,
      modifiers: decklistJSON.archetype.modifiers,
    });

    this.objective = decklistJSON.archetype?.objective;
    this.startingLocation = decklistJSON.archetype?.startingLocation;
    this.startingInterrupt = decklistJSON.archetype?.startingInterrupt;

    this.player = new Player({
      name: decklistJSON.player.name,
      aliases: decklistJSON.player.aliases,
    });

    this.cards = decklistJSON.cards;
  }

  get(attributeName: string): any {
    return (this as any)[attributeName];
  }

  searchData = (): string =>
    ` ${this.title}
      ${this.player.nameAndAliases().join(' ')}
      ${this.archetype.name}
      ${this.archetype.shortName}
      ${this.archetype.aliases.join(' ')}
      ${this.tournament.name}
      ${this.tournament.shortName}
      ${this.tournament.date}
      ${this.tournamentRound}`
      .replace('undefined', '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
}

export default Decklist;
