import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { ModifierComponent } from '@framework/modifier/modifier.component'
import { BuildingComponent, BuildingRegistry, type BuildingTypeId } from './building.component'
import { PlotComponent } from '../plot/plot.component'
import { QueueComponent } from '../queue/queue.component'

export type BuildParams = {
  plotEntity: Entity
  typeId: BuildingTypeId
  source?: string
}

export class BuildingAction {
  static build({ plotEntity, typeId, source = 'game' }: BuildParams): Entity | null {
    const def = BuildingRegistry.get(typeId)
    if (!def) return null

    const plot = World.get(plotEntity, PlotComponent)
    if (!plot || plot.buildingEntity !== null) return null

    const entity = World.spawn()
    World.add(entity, BuildingComponent, { typeId, plotEntity })
    World.add(entity, StatComponent, { values: {} })
    World.add(entity, ModifierComponent, { modifiers: [] })

    StatAction.set({ entity, statId: 'capacity', value: def.capacity, source })
    StatAction.set({ entity, statId: 'rideDuration', value: def.rideDuration, source })
    StatAction.set({ entity, statId: 'ticketPrice', value: def.inputAmount, source })

    plot.buildingEntity = entity

    const queueEntity = World.spawn()
    World.add(queueEntity, QueueComponent, {
      buildingEntity: entity,
      guests: [],
      maxLength: 100,
    })

    return entity
  }

  static getType({ entity }: { entity: Entity }) {
    const building = World.get(entity, BuildingComponent)
    return building ? BuildingRegistry.get(building.typeId) : undefined
  }
}
