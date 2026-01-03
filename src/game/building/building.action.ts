import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { Park } from '@game/park'
import { ParkAction } from '@game/park'
import {
  BuildingComponent,
  BuildingRegistry,
  type BuildingId,
  type BuildingDefinition,
  type StatChanges,
} from './building.component'
import { Plot } from '../plot/plot.component'
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

    if (!Plot.isEmpty(plotEntity)) return null

    const buildCost = this.getBuildCost(def)
    if (!Park.canAfford(buildCost)) return null

    const entity = World.spawn()
    World.add(entity, BuildingComponent, { id: buildingId, plotEntity })
    World.add(entity, StatComponent, { values: {} })

    StatAction.set({ entity, statId: 'capacity', value: def.capacity, source })
    StatAction.set({ entity, statId: 'duration', value: def.duration, source })

    this.applyParkEffects(def.on.build?.park, source)

    Plot.setBuilding(plotEntity, entity)

    const queueEntity = World.spawn()
    World.add(queueEntity, QueueComponent, {
      buildingEntity: entity,
      guests: [],
      maxLength: 100,
    })

    def.onBuild?.(entity)

    return entity
  }

  static getDefinition({ entity }: { entity: Entity }) {
    const building = World.get(entity, BuildingComponent)
    return building ? BuildingRegistry.get(building.id) : undefined
  }

  static getBuildCost(def: BuildingDefinition): number {
    const moneyCost = def.on.build?.park?.money ?? 0
    return moneyCost < 0 ? -moneyCost : 0
  }

  static getFee(def: BuildingDefinition): number {
    return def.on.visit?.park?.money ?? 0
  }

  static applyParkEffects(effects: StatChanges | undefined, source: string): void {
    if (!effects) return
    for (const [statId, amount] of Object.entries(effects)) {
      if (statId === 'money') {
        ParkAction.addMoney({ amount, source })
      } else {
        StatAction.change({ entity: Park.entity(), statId, delta: amount, source })
      }
    }
  }

  static applyGuestEffects(guestEntity: Entity, effects: StatChanges | undefined, source: string): void {
    if (!effects) return
    for (const [statId, amount] of Object.entries(effects)) {
      StatAction.change({ entity: guestEntity, statId, delta: amount, source })
    }
  }
}
