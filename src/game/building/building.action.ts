import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { ModifierAction } from '@framework/modifier/modifier.action'
import { Park, ParkStat } from '@game/park'
import { ParkAction } from '@game/park'
import { CONFIG } from '@framework/config'
import {
  Building,
  BuildingComponent,
  BuildingStatsComponent,
  BuildingRegistry,
  type BuildingId,
  type BuildingDefinition,
  type StatChanges,
} from './building.component'
import { PlotComponent } from '../plot/plot.component'
import { QueueComponent, Queue } from '../queue/queue.component'
import { GuestAction } from '../guest/guest.action'
import { GuestState } from '../guest/guest.component'

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

    const buildCost = this.getBuildCost(def)
    if (!Park.canAfford(buildCost)) return null

    const entity = World.spawn()
    World.add(entity, BuildingComponent, { id: buildingId, plotEntity })
    World.add(entity, StatComponent, { values: {} })
    World.add(entity, BuildingStatsComponent, { visits: 0, revenue: 0 })

    StatAction.set({ entity, statId: 'capacity', value: def.capacity, source })
    StatAction.set({ entity, statId: 'duration', value: def.duration, source })

    this.applyParkEffects(def.on.build?.park, source)
    this.applyAppeal(entity, def)
    this.boostNovelty(def)

    World.set(plotEntity, PlotComponent, { buildingEntity: entity })

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

  static demolish({ buildingEntity, source = 'game' }: { buildingEntity: Entity; source?: string }): number {
    const building = World.get(buildingEntity, BuildingComponent)
    if (!building) return 0

    const def = BuildingRegistry.get(building.id)
    if (!def) return 0

    const buildCost = this.getBuildCost(def)
    const refund = Math.floor(buildCost * 0.5)

    // Remove modifiers applied by this building (appeal, etc.)
    ModifierAction.removeBySource({ source: `building:${def.id}:${buildingEntity}` })

    // Find and remove the queue, reset guests to idle
    const queueEntity = this.findQueueForBuilding(buildingEntity)
    if (queueEntity) {
      const guests = Queue.guests(queueEntity)
      for (const guestEntity of guests) {
        GuestAction.changeState({
          entity: guestEntity,
          newState: GuestState.idle,
          target: null,
          source,
        })
      }
      World.despawn(queueEntity)
    }

    // Clear the plot reference
    const plotEntity = building.plotEntity
    const plot = World.get(plotEntity, PlotComponent)
    if (plot) {
      World.set(plotEntity, PlotComponent, { buildingEntity: null })
    }

    // Call onDestroy hook
    def.onDestroy?.(buildingEntity)

    // Refund money
    if (refund > 0) {
      ParkAction.addMoney({ amount: refund, source })
    }

    // Despawn the building entity
    World.despawn(buildingEntity)

    return refund
  }

  static getRefundAmount(buildingEntity: Entity): number {
    const def = this.getDefinition({ entity: buildingEntity })
    if (!def) return 0
    const buildCost = this.getBuildCost(def)
    return Math.floor(buildCost * 0.5)
  }

  private static queueQuery = World.createQuery([QueueComponent])

  private static findQueueForBuilding(buildingEntity: Entity): Entity | null {
    for (const queueEntity of World.query(this.queueQuery)) {
      if (Queue.building(queueEntity) === buildingEntity) {
        return queueEntity
      }
    }
    return null
  }

  private static applyAppeal(buildingEntity: Entity, def: BuildingDefinition): void {
    if (def.appeal <= 0) return
    ModifierAction.apply({
      targetEntity: Park.entity(),
      statId: ParkStat.attractiveness,
      phase: 'flat_add',
      value: def.appeal,
      source: `building:${def.id}:${buildingEntity}`,
    })
  }

  private static boostNovelty(def: BuildingDefinition): void {
    if (def.category !== 'ride') return

    const count = this.countBuildingsOfType(def.id)
    const boost = Math.max(CONFIG.novelty.boost.floor, Math.floor(CONFIG.novelty.boost.base / count))

    const current = Park.novelty()
    const newValue = Math.min(current + boost, CONFIG.novelty.max)
    ParkAction.setNovelty({ value: newValue, source: `building:${def.id}` })
  }

  private static buildingQuery = World.createQuery([BuildingComponent])

  private static countBuildingsOfType(buildingId: BuildingId): number {
    let count = 0
    for (const entity of World.query(this.buildingQuery)) {
      if (Building.id(entity) === buildingId) count++
    }
    return count
  }
}
