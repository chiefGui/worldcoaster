import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { StatComponent, Stat } from '@framework/stat/stat.component'
import { ModifierComponent } from '@framework/modifier/modifier.component'
import { Plot } from '../plot/plot.component'

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
  static create(plotEntity: Entity, typeId: BuildingTypeId): Entity {
    const def = BuildingRegistry.get(typeId)
    if (!def) throw new Error(`Unknown building type: ${typeId}`)

    const entity = World.spawn()
    World.add(entity, BuildingComponent, { typeId, plotEntity })
    World.add(entity, StatComponent, { values: {} })
    World.add(entity, ModifierComponent, { modifiers: [] })

    Stat.set(entity, 'capacity', def.capacity)
    Stat.set(entity, 'rideDuration', def.rideDuration)
    Stat.set(entity, 'ticketPrice', def.inputAmount)

    Plot.setBuilding(plotEntity, entity)

    return entity
  }

  static getType(entity: Entity): BuildingTypeDefinition | undefined {
    const data = World.get(entity, BuildingComponent)
    return data ? BuildingRegistry.get(data.typeId) : undefined
  }

  static getPlot(entity: Entity): Entity | null {
    const data = World.get(entity, BuildingComponent)
    return data?.plotEntity ?? null
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
