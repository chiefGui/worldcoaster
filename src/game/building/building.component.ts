import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

export const BuildingStat = {
  capacity: 'capacity',
  duration: 'duration',
  excitement: 'excitement',
  intensity: 'intensity',
  nauseaRating: 'nauseaRating',
} as const

export type BuildingStatId = (typeof BuildingStat)[keyof typeof BuildingStat]

export type BuildingId = string

export type BuildingCategory = 'ride' | 'facility' | 'shop'

export type StatChanges = Record<string, number>

export type BuildingTags = Record<string, number>

export type BuildingEffects = {
  park?: StatChanges
  guest?: StatChanges
}

export type BuildingOn = {
  build?: BuildingEffects
  tick?: BuildingEffects
  visit?: BuildingEffects
}

export type BuildingData = {
  id: BuildingId
  plotEntity: Entity
}

export const BuildingComponent: ComponentSchema<BuildingData> = World.registerComponent<BuildingData>(
  'Building'
)

export type BuildingHooks = {
  onBuild?: (entity: Entity) => void
  onDestroy?: (entity: Entity) => void
  onGuestEnter?: (buildingEntity: Entity, guestEntity: Entity) => void
  onGuestExit?: (buildingEntity: Entity, guestEntity: Entity) => void
}

export type BuildingDefinition = {
  id: BuildingId
  name: string
  icon?: string
  category: BuildingCategory
  capacity: number
  duration: number
  appeal: number
  tags: BuildingTags
  on: BuildingOn
} & BuildingHooks

export function defineBuilding<T extends BuildingDefinition>(def: T): T {
  return def
}

export class BuildingRegistry {
  private static readonly definitions = new Map<BuildingId, BuildingDefinition>()

  static register(def: BuildingDefinition): void {
    this.definitions.set(def.id, def)
  }

  static get(id: BuildingId): BuildingDefinition | undefined {
    return this.definitions.get(id)
  }

  static all(): readonly BuildingDefinition[] {
    return Array.from(this.definitions.values())
  }
}

export class Building {
  static get(entity: Entity): BuildingData | undefined {
    return World.get(entity, BuildingComponent)
  }

  static id(entity: Entity): BuildingId | undefined {
    const building = World.get(entity, BuildingComponent)
    return building?.id
  }

  static definition(entity: Entity): BuildingDefinition | undefined {
    const building = World.get(entity, BuildingComponent)
    return building ? BuildingRegistry.get(building.id) : undefined
  }

  static plot(entity: Entity): Entity | undefined {
    const building = World.get(entity, BuildingComponent)
    return building?.plotEntity
  }
}
