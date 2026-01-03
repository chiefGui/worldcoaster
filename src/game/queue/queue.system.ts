import type { QuerySchema } from '@ecs/query'
import { World } from '@ecs/world'
import { System, After } from '@ecs/decorator'
import { QueueComponent, Queue } from './queue.component'
import { QueueAction } from './queue.action'
import { Building } from '../building/building.component'
import { GuestAction } from '../guest/guest.action'
import { Modifier } from '@framework/modifier/modifier.component'

@System('queue')
@After('guest')
export class QueueSystem {
  private static queueQuery: QuerySchema | null = null

  private static getQueueQuery(): QuerySchema {
    return this.queueQuery ??= World.createQuery([QueueComponent])
  }

  static tick(_dt: number): void {
    const queues = World.query(this.getQueueQuery())

    for (const queueEntity of queues) {
      const buildingEntity = Queue.building(queueEntity)
      if (!buildingEntity) continue

      const def = Building.type(buildingEntity)
      if (!def) continue

      const capacity = Math.floor(Modifier.compute(buildingEntity, 'capacity', def.capacity))
      const guests = QueueAction.dequeue({ queueEntity, count: capacity, source: 'queue-system' })

      for (const guestEntity of guests) {
        const rideDuration = Modifier.compute(buildingEntity, 'rideDuration', def.rideDuration)
        GuestAction.startRide({
          entity: guestEntity,
          buildingEntity,
          duration: rideDuration,
          source: 'queue-system',
        })
      }
    }
  }
}
