import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { EffectProcessor } from '@framework/effect'
import { QueueComponent, Queue } from './queue.component'
import { GuestComponent } from '../guest/guest.component'

export type JoinQueueParams = {
  queueEntity: Entity
  guestEntity: Entity
  source: string
}

export type LeaveQueueParams = {
  queueEntity: Entity
  guestEntity: Entity
  source: string
}

export type DequeueParams = {
  queueEntity: Entity
  count: number
  source: string
}

export class QueueAction {
  static join({ queueEntity, guestEntity, source }: JoinQueueParams): boolean {
    const queue = World.get(queueEntity, QueueComponent)
    const guest = World.get(guestEntity, GuestComponent)
    if (!queue || !guest) return false
    if (Queue.isFull(queueEntity)) return false

    const effect = EffectProcessor.process<{ guestEntity: Entity }>({
      type: 'queue:join',
      entity: queueEntity,
      source,
      timestamp: 0,
      payload: { guestEntity },
    })

    if (!effect) return false

    queue.guests.push(effect.payload.guestEntity)
    return true
  }

  static leave({ queueEntity, guestEntity, source }: LeaveQueueParams): boolean {
    const queue = World.get(queueEntity, QueueComponent)
    if (!queue) return false

    const idx = queue.guests.indexOf(guestEntity)
    if (idx === -1) return false

    const effect = EffectProcessor.process<{ guestEntity: Entity; position: number }>({
      type: 'queue:leave',
      entity: queueEntity,
      source,
      timestamp: 0,
      payload: { guestEntity, position: idx },
    })

    if (!effect) return false

    queue.guests.splice(idx, 1)
    return true
  }

  static dequeue({ queueEntity, count, source }: DequeueParams): Entity[] {
    const queue = World.get(queueEntity, QueueComponent)
    if (!queue) return []

    const toDequeue = Math.min(count, queue.guests.length)
    const dequeued: Entity[] = []

    for (let i = 0; i < toDequeue; i++) {
      const guestEntity = queue.guests[0]
      if (guestEntity === undefined) break

      const effect = EffectProcessor.process<{ guestEntity: Entity; position: number }>({
        type: 'queue:leave',
        entity: queueEntity,
        source,
        timestamp: 0,
        payload: { guestEntity, position: 0 },
      })

      if (effect) {
        queue.guests.shift()
        dequeued.push(guestEntity)
      }
    }

    return dequeued
  }
}
