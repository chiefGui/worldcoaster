import { World } from '@ecs/world'
import { QueueComponent, Queue } from './queue.component'
import { Building } from '../building/building.component'
import { Guest } from '../guest/guest.component'
import { Action } from '@framework/action'
import { Modifier } from '@framework/modifier/modifier.component'

export class QueueSystem {
  private static readonly NAME = 'queue'

  static register(): void {
    World.registerSystem(this.NAME, (_dt: number) => {
      const queues = World.query(World.createQuery([QueueComponent]))

      for (const queueEntity of queues) {
        const buildingEntity = Queue.getBuilding(queueEntity)
        if (!buildingEntity) continue

        const def = Building.getType(buildingEntity)
        if (!def) continue

        const capacity = Math.floor(Modifier.compute(buildingEntity, 'capacity', def.capacity))
        const guests = Queue.dequeue(queueEntity, capacity)

        for (const guestEntity of guests) {
          const rideDuration = Modifier.compute(buildingEntity, 'rideDuration', def.rideDuration)
          Guest.setRideTime(guestEntity, rideDuration)
          Action.guestStateChange(guestEntity, 'riding', buildingEntity, 'queue-system')
        }
      }
    }, ['guest'])
  }
}
