// Strongly typed stat IDs for the game
// Add new stats here - they're automatically available everywhere

export const GameStat = {
  // Guest stats
  MONEY: 'money',
  HAPPINESS: 'happiness',
  HUNGER: 'hunger',
  THIRST: 'thirst',
  ENERGY: 'energy',
  NAUSEA: 'nausea',

  // Building stats
  CAPACITY: 'capacity',
  RIDE_DURATION: 'rideDuration',
  TICKET_PRICE: 'ticketPrice',
  EXCITEMENT: 'excitement',
  INTENSITY: 'intensity',
  NAUSEA_RATING: 'nauseaRating',

  // Economy stats
  REVENUE: 'revenue',
  MAINTENANCE_COST: 'maintenanceCost',
} as const

export type GameStatId = typeof GameStat[keyof typeof GameStat]

// Strongly typed modifier tags
// Add new tags here for categorization and bulk operations

export const ModifierTag = {
  // Effect types
  BUFF: 'buff',
  DEBUFF: 'debuff',
  NEUTRAL: 'neutral',

  // Sources
  CONSUMABLE: 'consumable',
  EQUIPMENT: 'equipment',
  ENVIRONMENT: 'environment',
  WEATHER: 'weather',
  EVENT: 'event',

  // Removal categories
  CLEANSABLE: 'cleansable',    // Can be removed by cleanse effects
  PERMANENT: 'permanent',       // Cannot be removed normally
  TRANSFERABLE: 'transferable', // Can spread to other entities
} as const

export type ModifierTagId = typeof ModifierTag[keyof typeof ModifierTag]
