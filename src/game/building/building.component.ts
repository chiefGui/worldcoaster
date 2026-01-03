import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

// Building stats - colocated with domain
export const BuildingStat = {
  capacity: 'capacity',
  rideDuration: 'rideDuration',
  ticketPrice: 'ticketPrice',
  excitement: 'excitement',
  intensity: 'intensity',
  nauseaRating: 'nauseaRating',
  maintenanceCost: 'maintenanceCost',
} as const

export type BuildingStatId = typeof BuildingStat[keyof typeof BuildingStat]

export type BuildingTypeId = string

export type BuildingData = {
  typeId: BuildingTypeId
  plotEntity: Entity
}

export const BuildingComponent: ComponentSchema<BuildingData> = World.registerComponent<BuildingData>(
  'Building'
)

export type BuildingTypeDefinition = {
  id: BuildingTypeId
  name: string
  inputStat: string
  inputAmount: number
  outputStat: string
  outputAmount: number
  capacity: number
  rideDuration: number
}

export class BuildingRegistry {
  private static readonly types = new Map<BuildingTypeId, BuildingTypeDefinition>()

  static register(def: BuildingTypeDefinition): void {
    this.types.set(def.id, def)
  }

  static get(typeId: BuildingTypeId): BuildingTypeDefinition | undefined {
    return this.types.get(typeId)
  }

  static all(): readonly BuildingTypeDefinition[] {
    return Array.from(this.types.values())
  }
}

export class Building {
  static get(entity: Entity): BuildingData | undefined {
    return World.get(entity, BuildingComponent)
  }

  static typeId(entity: Entity): BuildingTypeId | undefined {
    const building = World.get(entity, BuildingComponent)
    return building?.typeId
  }

  static type(entity: Entity): BuildingTypeDefinition | undefined {
    const building = World.get(entity, BuildingComponent)
    return building ? BuildingRegistry.get(building.typeId) : undefined
  }

  static plot(entity: Entity): Entity | undefined {
    const building = World.get(entity, BuildingComponent)
    return building?.plotEntity
  }
}

BuildingRegistry.register({
  id: 'carousel',
  name: 'Carousel',
  inputStat: 'money',
  inputAmount: 5,
  outputStat: 'happiness',
  outputAmount: 10,
  capacity: 12,
  rideDuration: 3,
})
