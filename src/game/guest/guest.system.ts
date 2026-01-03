import type { QuerySchema } from '@ecs/query'
import { World } from '@ecs/world'
import { System } from '@ecs/decorator'
import { GuestComponent, Guest, GuestState } from './guest.component'
import { GuestAction } from './guest.action'
import { BuildingComponent, Building } from '../building/building.component'
import { QueueComponent, Queue } from '../queue/queue.component'
import { QueueAction } from '../queue/queue.action'
import { Stat } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'

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

    const ticketPrice = Stat.getFinal(building, 'ticketPrice')
    if (!Guest.canAfford(entity, ticketPrice)) return

    const queueEntity = this.findQueueForBuilding(building)
    if (!queueEntity) return

    if (Queue.isFull(queueEntity)) return

    if (GuestAction.pay({ entity, amount: ticketPrice, source: def.id })) {
      QueueAction.join({ queueEntity, guestEntity: entity, source: 'guest-system' })
      GuestAction.changeState({ entity, newState: GuestState.queuing, target: queueEntity, source: 'guest-system' })
    }
  }

  private static processRidingGuest(entity: number, dt: number): void {
    const finished = GuestAction.tickRide({ entity, dt })
    if (finished) {
      const target = Guest.target(entity)
      if (target) {
        const def = Building.definition(target)
        if (def) {
          for (const effect of def.output) {
            StatAction.change({ entity, statId: effect.stat, delta: effect.amount, source: def.id })
          }
        }
      }
      GuestAction.changeState({ entity, newState: GuestState.idle, target: null, source: 'guest-system' })
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

      const happiness = Stat.get(entity, 'happiness')
      if (happiness <= 0) {
        GuestAction.changeState({ entity, newState: GuestState.leaving, target: null, source: 'guest-system' })
      }
    }
  }
}
