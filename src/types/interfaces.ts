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
 * Interface for theme styling properties
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
 * Interface for a card in a decklist with quantity information
 */
export interface DecklistCard {
  id: string;
  quantity: number;
  card: unknown; // This will be a Card object but using unknown for type safety
  title: string;
  type?: string;
  imageUrl: string;
  imageBackUrl?: string;
  aspectRatio?: number;
  side?: string;
  displayTitle?: string;
  displaySubtitle?: string;
  offsetY?: number;
  sideways?: boolean;
}

/**
 * Type definitions for callback functions
 */
export type SearchCallback = (query: string) => void;
export type ScrollToIndexFunction = (index: number) => void;

/**
 * Generic API response interfaces
 */
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

/**
 * Interface for a complete decklist
 */
export interface Decklist {
  id: string;
  name: string;
  description?: string;
  cards: DecklistCard[];
  side: string;
  displaySubtitle: string;
}

/**
 * Navigation parameter types for React Navigation
 */
export type RootStackParamList = {
  Cards: undefined;
  Decklists: undefined;
  DecklistDetail: { decklistId: string };
  Settings: undefined;
  CardDetail: { cardId: string };
};

/**
 * Result type for filter operations
 */
/**
 * Filter parameter interface
 */
export interface FilterParams {
  field: unknown | null; // Field object type
  comparator: unknown | null; // Comparator object type
  value: string | null;
  rawField: string | null;
  rawComparator: string | null;
  rawValue: string | null;
  filter?: unknown; // Filter object type
  query?: string;
}

/**
 * Filter match result interface
 */
export interface FilterMatch {
  field?: unknown; // Field object type
  comparator?: unknown; // Comparator object type
  value?: string;
  rawField?: string;
  rawComparator?: string;
  rawValue?: string;
}

/**
 * Filter result interface
 */
export interface FilterResult {
  cards: unknown[]; // Card array
  count: number;
  executionTime?: number;
}