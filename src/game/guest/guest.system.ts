import { World } from '@ecs/world'
import { GuestComponent, Guest } from './guest.component'
import { BuildingComponent, Building } from '../building/building.component'
import { QueueComponent, Queue } from '../queue/queue.component'
import { Action } from '@framework/action'
import { Stat } from '@framework/stat/stat.component'
import { Modifier } from '@framework/modifier/modifier.component'

export class GuestSystem {
  private static readonly NAME = 'guest'

  private static findRandomBuilding(): number | null {
    const buildings = World.query(World.createQuery([BuildingComponent]))
    const arr = Array.from(buildings)
    if (arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)] ?? null
  }

  private static findQueueForBuilding(buildingEntity: number): number | null {
    const queues = World.query(World.createQuery([QueueComponent]))
    for (const queueEntity of queues) {
      if (Queue.getBuilding(queueEntity) === buildingEntity) {
        return queueEntity
      }
    }
    return null
  }

  private static processIdleGuest(entity: number): void {
    const building = this.findRandomBuilding()
    if (!building) return

    const def = Building.getType(building)
    if (!def) return

    const ticketPrice = Modifier.compute(building, 'ticketPrice', def.inputAmount)
    if (!Guest.canAfford(entity, ticketPrice)) return

    const queueEntity = this.findQueueForBuilding(building)
    if (!queueEntity) return

    if (Queue.isFull(queueEntity)) return

    if (Action.guestPay(entity, ticketPrice, def.id)) {
      Queue.join(queueEntity, entity)
      Action.guestStateChange(entity, 'queuing', queueEntity, 'guest-system')
    }
  }

  private static processRidingGuest(entity: number, dt: number): void {
    const finished = Guest.tickRide(entity, dt)
    if (finished) {
      const target = Guest.getTarget(entity)
      if (target) {
        const def = Building.getType(target)
        if (def) {
          Action.changeStat(entity, def.outputStat, def.outputAmount, def.id)
        }
      }
      Action.guestStateChange(entity, 'idle', null, 'guest-system')
    }
  }

  static register(): void {
    World.registerSystem(this.NAME, (dt: number) => {
      const guests = World.query(World.createQuery([GuestComponent]))

      for (const entity of guests) {
        const state = Guest.getState(entity)

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
          Action.guestStateChange(entity, 'leaving', null, 'guest-system')
        }
      }
    })
  }
}
