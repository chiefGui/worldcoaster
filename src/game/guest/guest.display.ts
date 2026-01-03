import { GuestStat, type GuestStatId, type GuestState } from './guest.component'

// Display metadata for guest stats - used by UI components
export type StatDisplay = {
  name: string
  icon?: string
  format?: 'number' | 'currency' | 'percentage'
  color?: string
}

export const GuestStatDisplay: Record<GuestStatId, StatDisplay> = {
  [GuestStat.money]: {
    name: 'Money',
    icon: '💰',
    format: 'currency',
  },
  [GuestStat.happiness]: {
    name: 'Happiness',
    icon: '😊',
    format: 'percentage',
    color: 'text-yellow-500',
  },
  [GuestStat.hunger]: {
    name: 'Hunger',
    icon: '🍔',
    format: 'percentage',
    color: 'text-orange-500',
  },
  [GuestStat.thirst]: {
    name: 'Thirst',
    icon: '🥤',
    format: 'percentage',
    color: 'text-blue-500',
  },
  [GuestStat.energy]: {
    name: 'Energy',
    icon: '⚡',
    format: 'percentage',
    color: 'text-green-500',
  },
  [GuestStat.nausea]: {
    name: 'Nausea',
    icon: '🤢',
    format: 'percentage',
    color: 'text-purple-500',
  },
}

// Display metadata for guest states
export const GuestStateDisplay: Record<GuestState, { name: string; icon?: string }> = {
  idle: { name: 'Wandering', icon: '🚶' },
  walking: { name: 'Walking', icon: '🚶' },
  queuing: { name: 'In Queue', icon: '⏳' },
  riding: { name: 'On Ride', icon: '🎢' },
  leaving: { name: 'Leaving', icon: '👋' },
}
