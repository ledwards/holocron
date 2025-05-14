import { CardSide, CardRarity, CardUniqueness, CardType } from './enums';
import Card from '../models/Card';
import Field from '../models/Field';
import Comparator from '../models/Comparator';
import Filter from '../models/Filter';

// Theme interfaces
export interface Theme {
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  dividerColor: string;
  translucentBackgroundColor: string;
  secondaryBackgroundColor: string;
  iconColor: string;
  statusBarStyle: 'default' | 'light-content' | 'dark-content';
  chipYesBackgroundColor: string;
  chipNoBackgroundColor: string;
  chipYesBorderColor: string;
  chipNoBorderColor: string;
  chipYesTextColor: string;
  chipNoTextColor: string;
}

// Card JSON interfaces
export interface CardFrontJSON {
  title: string;
  type: string;
  subType: string;
  ability?: number;
  armor?: number;
  darkSideIcons?: number;
  deploy?: number;
  destiny?: number;
  ferocity?: string;
  forfeit?: number;
  hyperspeed?: number;
  landspeed?: number;
  lightSideIcons?: number;
  maneuver?: number;
  parsec?: number;
  politics?: number;
  power?: number;
  characteristics: string[];
  icons: string[];
  gametext?: string;
  lore?: string;
  imageUrl: string;
  extraText?: string[];
  uniqueness?: string;
}

export interface CardJSON {
  gempId: string;
  front: CardFrontJSON;
  back?: CardFrontJSON;
  side: CardSide;
  set: string;
  rarity: string;
  abbr?: string[];
  cancels?: string[];
  canceledBy?: string[];
  matching?: string[];
  matchingWeapon?: string[];
  pulledBy?: string[];
  pulls?: string[];
  underlyingCardFor?: string;
  counterpart?: string;
}

// Expansion Set JSON interfaces
export interface ExpansionSetJSON {
  id: string;
  name: string;
  abbr: string;
  gempName: string;
  legacy?: boolean;
}

// Decklist interfaces
export interface DecklistCard {
  id: string;
  quantity: number;
}

export interface TournamentJSON {
  name: string;
  shortName: string;
  eventName: string;
  date: string;
  format?: string;
  round?: string;
}

export interface ArchetypeJSON {
  name: string;
  shortName: string;
  aliases: string[];
  modifiers: string[];
  imageUrl: string;
  objective?: string;
  startingLocation?: string;
  startingInterrupt?: string;
}

export interface PlayerJSON {
  name: string;
  aliases: string[];
}

export interface DecklistJSON {
  slug: string;
  region?: string;
  title: string;
  url: string;
  date: string;
  side: string;
  plaintext: string;
  cards: Record<string, number>;
  tournament?: TournamentJSON;
  archetype: ArchetypeJSON;
  player: PlayerJSON;
}

// Search interfaces
export interface SearchMode {
  index: number;
  label: string;
  icon: string;
  title: string;
  description: string;
}

// Filter interfaces
export interface FilterParams {
  field: Field | null;
  comparator: Comparator | null;
  value: string | null;
  rawField: string | null;
  rawComparator: string | null;
  rawValue: string | null;
  filter?: Filter;
}

export interface FilterMatch {
  field?: Field;
  comparator?: Comparator;
  value?: string;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;
}

export interface FilterResult {
  cards: Card[];
  count: number;
  executionTime?: number;
}

// Navigation interfaces
export type RootStackParamList = {
  Cards: undefined;
  Decklists: undefined;
  DecklistDetail: { decklistId: string };
};

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CardsResponse {
  cards: CardJSON[];
}

export interface ExpansionSetsResponse {
  sets: ExpansionSetJSON[];
}

export interface DecklistsResponse {
  decklists: DecklistJSON[];
}

// Callback types
export type SearchCallback = (query: string) => void;
export type ScrollToIndexFunction = (index: number) => void;