import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { StatEffectUtil } from '@framework/stat/stat-effect'
import { BuildingComponent, BuildingRegistry, type BuildingId } from './building.component'
import { PlotComponent } from '../plot/plot.component'
import { QueueComponent } from '../queue/queue.component'

export type BuildParams = {
  plotEntity: Entity
  buildingId: BuildingId
  source?: string
}

export class BuildingAction {
  static build({ plotEntity, buildingId, source = 'game' }: BuildParams): Entity | null {
    const def = BuildingRegistry.get(buildingId)
    if (!def) return null

    const plot = World.get(plotEntity, PlotComponent)
    if (!plot || plot.buildingEntity !== null) return null

    const entity = World.spawn()
    World.add(entity, BuildingComponent, { id: buildingId, plotEntity })
    World.add(entity, StatComponent, { values: {} })

    StatAction.set({ entity, statId: 'capacity', value: def.capacity, source })
    StatAction.set({ entity, statId: 'duration', value: def.duration, source })

    const moneyInput = StatEffectUtil.find(def.input, 'money')
    if (moneyInput) {
      StatAction.set({ entity, statId: 'ticketPrice', value: moneyInput.amount, source })
    }

    plot.buildingEntity = entity

    const queueEntity = World.spawn()
    World.add(queueEntity, QueueComponent, {
      buildingEntity: entity,
      guests: [],
      maxLength: 100,
    })

    return entity
  }

  static getDefinition({ entity }: { entity: Entity }) {
    const building = World.get(entity, BuildingComponent)
    return building ? BuildingRegistry.get(building.id) : undefined
  }
}
