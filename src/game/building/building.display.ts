import { BuildingStat, type BuildingStatId, BuildingRegistry } from './building.component'

// Display metadata for building stats - used by UI components
export type StatDisplay = {
  name: string
  icon?: string
  format?: 'number' | 'currency' | 'percentage' | 'duration'
  color?: string
}

export const BuildingStatDisplay: Record<BuildingStatId, StatDisplay> = {
  [BuildingStat.capacity]: {
    name: 'Capacity',
    icon: '👥',
    format: 'number',
  },
  [BuildingStat.rideDuration]: {
    name: 'Ride Duration',
    icon: '⏱️',
    format: 'duration',
  },
  [BuildingStat.ticketPrice]: {
    name: 'Ticket Price',
    icon: '🎟️',
    format: 'currency',
  },
  [BuildingStat.excitement]: {
    name: 'Excitement',
    icon: '🎉',
    format: 'percentage',
    color: 'text-green-500',
  },
  [BuildingStat.intensity]: {
    name: 'Intensity',
    icon: '💪',
    format: 'percentage',
    color: 'text-red-500',
  },
  [BuildingStat.nauseaRating]: {
    name: 'Nausea Rating',
    icon: '🤢',
    format: 'percentage',
    color: 'text-purple-500',
  },
  [BuildingStat.maintenanceCost]: {
    name: 'Maintenance',
    icon: '🔧',
    format: 'currency',
  },
}

// Display helpers for building types
export class BuildingDisplay {
  static getName(typeId: string): string {
    return BuildingRegistry.get(typeId)?.name ?? typeId
  }

  static getStatLabel(statId: BuildingStatId): string {
    return BuildingStatDisplay[statId]?.name ?? statId
  }
}
