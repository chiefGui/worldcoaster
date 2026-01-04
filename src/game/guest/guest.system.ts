import type { QuerySchema } from '@ecs/query'
import { World } from '@ecs/world'
import { System } from '@ecs/decorator'
import { GuestComponent, Guest, GuestState, GuestStat } from './guest.component'
import { GuestAction } from './guest.action'
import { BuildingComponent, Building } from '../building/building.component'
import { BuildingAction } from '../building/building.action'
import { QueueComponent, Queue } from '../queue/queue.component'
import { QueueAction } from '../queue/queue.action'
import { Stat } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'

const NEED_DECAY_RATE = 1

@System('guest')
export class GuestSystem {
  private static guestQuery: QuerySchema | null = null
  private static buildingQuery: QuerySchema | null = null
  private static queueQuery: QuerySchema | null = null

  private static getGuestQuery(): QuerySchema {
    return this.guestQuery ??= World.createQuery([GuestComponent])
  }

  private static getBuildingQuery(): QuerySchema {
    return this.buildingQuery ??= World.createQuery([BuildingComponent])
  }

  private static getQueueQuery(): QuerySchema {
    return this.queueQuery ??= World.createQuery([QueueComponent])
  }

  private static findRandomBuilding(): number | null {
    const buildings = World.query(this.getBuildingQuery())
    const size = buildings.size
    if (size === 0) return null

    const targetIdx = Math.floor(Math.random() * size)
    let idx = 0
    for (const entity of buildings) {
      if (idx === targetIdx) return entity
      idx++
    }
    return null
  }

  private static findQueueForBuilding(buildingEntity: number): number | null {
    const queues = World.query(this.getQueueQuery())
    for (const queueEntity of queues) {
      if (Queue.building(queueEntity) === buildingEntity) {
        return queueEntity
      }
    }
    return null
  }

  private static processIdleGuest(entity: number): void {
    const building = this.findRandomBuilding()
    if (!building) return

    const def = Building.definition(building)
    if (!def) return

    const queueEntity = this.findQueueForBuilding(building)
    if (!queueEntity) return

    if (Queue.isFull(queueEntity)) return

    BuildingAction.applyParkEffects(def.on.visit?.park, def.id)
    QueueAction.join({ queueEntity, guestEntity: entity, source: 'guest-system' })
    GuestAction.changeState({ entity, newState: GuestState.queuing, target: queueEntity, source: 'guest-system' })
  }

  private static processRidingGuest(entity: number, dt: number): void {
    const finished = GuestAction.tickRide({ entity, dt })
    if (finished) {
      const target = Guest.target(entity)
      if (target) {
        const def = Building.definition(target)
        if (def) {
          BuildingAction.applyGuestEffects(entity, def.on.visit?.guest, def.id)
        }
      }
      GuestAction.changeState({ entity, newState: GuestState.idle, target: null, source: 'guest-system' })
    }
  }

  private static decayNeeds(entity: number): void {
    const needs = [GuestStat.happiness, GuestStat.hunger, GuestStat.thirst, GuestStat.energy, GuestStat.comfort] as const
    for (const need of needs) {
      const current = Stat.get(entity, need)
      if (current > 0) {
        StatAction.change({ entity, statId: need, delta: -NEED_DECAY_RATE, source: 'guest-system' })
      }
    }
  }

  static tick(dt: number): void {
    const guests = World.query(this.getGuestQuery())

    for (const entity of guests) {
      const state = Guest.state(entity)

      switch (state) {
        case GuestState.idle:
          this.processIdleGuest(entity)
          break
        case GuestState.riding:
          this.processRidingGuest(entity, dt)
          break
      }

      this.decayNeeds(entity)

      const happiness = Stat.get(entity, GuestStat.happiness)
      if (happiness <= 0) {
        GuestAction.changeState({ entity, newState: GuestState.leaving, target: null, source: 'guest-system' })
      }
    }
  }
}
