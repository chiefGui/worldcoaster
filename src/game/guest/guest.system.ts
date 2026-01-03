import { World } from '@ecs/world'
import { System } from '@ecs/decorator'
import { GuestComponent, Guest } from './guest.component'
import { GuestAction } from './guest.action'
import { BuildingComponent, Building } from '../building/building.component'
import { QueueComponent, Queue } from '../queue/queue.component'
import { QueueAction } from '../queue/queue.action'
import { Stat } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { Modifier } from '@framework/modifier/modifier.component'

@System('guest')
export class GuestSystem {
  private static findRandomBuilding(): number | null {
    const buildings = World.query(World.createQuery([BuildingComponent]))
    const arr = Array.from(buildings)
    if (arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)] ?? null
  }

  private static findQueueForBuilding(buildingEntity: number): number | null {
    const queues = World.query(World.createQuery([QueueComponent]))
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

    const def = Building.type(building)
    if (!def) return

    const ticketPrice = Modifier.compute(building, 'ticketPrice', def.inputAmount)
    if (!Guest.canAfford(entity, ticketPrice)) return

    const queueEntity = this.findQueueForBuilding(building)
    if (!queueEntity) return

    if (Queue.isFull(queueEntity)) return

    if (GuestAction.pay({ entity, amount: ticketPrice, source: def.id })) {
      QueueAction.join({ queueEntity, guestEntity: entity, source: 'guest-system' })
      GuestAction.changeState({ entity, newState: 'queuing', target: queueEntity, source: 'guest-system' })
    }
  }

  private static processRidingGuest(entity: number, dt: number): void {
    const finished = GuestAction.tickRide({ entity, dt })
    if (finished) {
      const target = Guest.target(entity)
      if (target) {
        const def = Building.type(target)
        if (def) {
          StatAction.change({ entity, statId: def.outputStat, delta: def.outputAmount, source: def.id })
        }
      }
      GuestAction.changeState({ entity, newState: 'idle', target: null, source: 'guest-system' })
    }
  }

  static tick(dt: number): void {
    const guests = World.query(World.createQuery([GuestComponent]))

    for (const entity of guests) {
      const state = Guest.state(entity)

      switch (state) {
        case 'idle':
          this.processIdleGuest(entity)
          break
        case 'riding':
          this.processRidingGuest(entity, dt)
          break
      }

      const happiness = Stat.get(entity, 'happiness')
      if (happiness <= 0) {
        GuestAction.changeState({ entity, newState: 'leaving', target: null, source: 'guest-system' })
      }
    }
  }
}
