/**
 * Enum for card sides (Light and Dark)
 */
export enum CardSide {
  Light = 'Light',
  Dark = 'Dark',
}

/**
 * Enum for card uniqueness values
 */
export enum CardUniqueness {
  Unique = 'Unique',
  Representative = 'Representative',
  Normal = 'Normal',
}

/**
 * Enum for card rarities
 */
export enum CardRarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Premium = 'Premium',
  FixedCard = 'Fixed Card',
}

/**
 * Enum for card types
 */
export enum CardType {
  Admiral = 'Admiral',
  Alien = 'Alien',
  Artifact = 'Artifact',
  Character = 'Character',
  Creature = 'Creature',
  Device = 'Device',
  Defensive = 'Defensive',
  Effect = 'Effect',
  EPP = 'EPP',
  Immediate = 'Immediate',
  Interrupt = 'Interrupt',
  Jedi = 'Jedi',
  Location = 'Location',
  Lost = 'Lost',
  Objective = 'Objective',
  Podracer = 'Podracer',
  Republic = 'Republic',
  Rebel = 'Rebel',
  Sith = 'Sith',
  Starship = 'Starship',
  Starting = 'Starting',
  Utinni = 'Utinni',
  Vehicle = 'Vehicle',
  Weapon = 'Weapon',
}

/**
 * Enum for display sizes
 */
export enum DisplaySize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

/**
 * Enum for expansion set status
 */
export enum ExpansionSetStatus {
  Current = 'current',
  Legacy = 'legacy',
  All = 'all',
}

/**
 * Enum for search modes
 */
export enum SearchMode {
  TextSearch = 'text',
  TitleSearch = 'title',
  GameTextSearch = 'gametext',
  LoreSearch = 'lore',
}

/**
 * Enum for sort options
 */
export enum SortOption {
  Title = 'title',
  Type = 'type',
  Rarity = 'rarity',
  Set = 'set',
}

/**
 * Enum for query statuses
 */
export enum QueryStatus {
  Ready = 'ready',
  Searching = 'searching',
  NoResults = 'no_results',
  Error = 'error',
}

/**
 * Enum for filter operators
 */
export enum FilterOperator {
  Equals = 'equals',
  Contains = 'contains',
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with',
}