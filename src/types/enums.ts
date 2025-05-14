/**
 * Represents the side (Light or Dark) of a card in the Star Wars CCG
 */
export enum CardSide {
  Light = 'Light',
  Dark = 'Dark'
}

/**
 * Represents the uniqueness status of a card
 */
export enum CardUniqueness {
  None = 'none',
  Unique = 'unique',
  Restricted = 'restricted'
}

/**
 * Represents the rarity of a card
 */
export enum CardRarity {
  C = 'C',  // Common
  U = 'U',  // Uncommon
  R = 'R',  // Rare
  V = 'V',  // Virtual
  PM = 'PM', // Premium
  PV = 'PV'  // Premium Virtual
}

/**
 * Represents the card type in Star Wars CCG
 */
export enum CardType {
  Character = 'Character',
  Effect = 'Effect',
  Interrupt = 'Interrupt',
  Location = 'Location',
  Weapon = 'Weapon',
  Vehicle = 'Vehicle',
  Device = 'Device',
  Creature = 'Creature',
  Starship = 'Starship',
  Objective = 'Objective',
  Admiral = 'Admiral\'s Order',
  Epic = 'Epic Event',
  Defensive = 'Defensive Shield',
  Jedi = 'Jedi Test',
  GameAid = 'Game Aid'
}