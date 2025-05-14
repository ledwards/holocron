/**
 * Interface for JSON data representing a card
 */
export interface CardJSON {
  gempId: string;
  front: {
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
  };
  side: string;
  set: string;
  rarity: string;
  abbr?: string[];
  back?: {
    imageUrl?: string;
    gametext?: string;
    extratext?: string;
    extraText?: string[];
  };
  cancels?: string[];
  canceledBy?: string[];
  matching?: string[];
  matchingWeapon?: string[];
  pulledBy?: string[];
  pulls?: string[];
  underlyingCardFor?: string;
  counterpart?: string;
}

/**
 * Interface for theme styling properties used throughout the application
 */
export interface Theme {
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  dividerColor: string;
  translucentBackgroundColor: string;
  secondaryBackgroundColor?: string;
  iconColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  chipYesBackgroundColor?: string;
  chipNoBackgroundColor?: string;
  chipYesBorderColor?: string;
  chipNoBorderColor?: string;
  chipYesTextColor?: string;
  chipNoTextColor?: string;
}

/**
 * Interface for Search Mode configuration
 */
export interface SearchMode {
  index: number;
  label: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * Interface for expansion set data
 */
export interface ExpansionSetJSON {
  id: string;
  name: string;
  abbr: string;
  gempName: string;
  legacy?: boolean;
}

/**
 * Interface representing a card in a decklist with quantity
 */
export interface DecklistCard {
  id: string;
  quantity: number;
}

/**
 * Interface for Decklist JSON data
 */
export interface DecklistJSON {
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
    format?: string;
    round?: string;
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
}

/**
 * Interface for filter query parameters
 */
export interface FilterParams {
  field: any | null;
  comparator: any | null;
  value: string | null;
  rawField: string | null;
  rawComparator: string | null;
  rawValue: string | null;
  filter?: any;
}

/**
 * Interface for filter query matches
 */
export interface FilterMatch {
  field?: any;
  comparator?: any;
  value?: string;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;
}

/**
 * Interface for filter results including metadata
 */
export interface FilterResult {
  cards: any[]; // Using any[] instead of Card[] to avoid circular references
  count: number;
  executionTime?: number;
}

/**
 * Navigation type for type-safe navigation between screens
 */
export type RootStackParamList = {
  Cards: undefined;
  Decklists: undefined;
  DecklistDetail: { decklistId: string };
};

/**
 * Generic interface for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Interface for card data responses from the API
 */
export interface CardsResponse {
  cards: CardJSON[];
}

/**
 * Interface for expansion sets responses from the API
 */
export interface ExpansionSetsResponse {
  sets: ExpansionSetJSON[];
}

/**
 * Interface for decklists responses from the API
 */
export interface DecklistsResponse {
  decklists: DecklistJSON[];
}

/**
 * Type definition for search callback functions
 */
export type SearchCallback = (query: string) => void;

/**
 * Type definition for scroll to index functions
 */
export type ScrollToIndexFunction = (index: number) => void;