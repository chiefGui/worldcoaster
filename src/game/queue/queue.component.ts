import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

export type QueueData = {
  buildingEntity: Entity
  guests: Entity[]
  maxLength: number
}

export const QueueComponent: ComponentSchema<QueueData> = World.registerComponent<QueueData>(
  'Queue'
)

export class Queue {
  static create(buildingEntity: Entity, maxLength = 100): Entity {
    const entity = World.spawn()
    World.add(entity, QueueComponent, {
      buildingEntity,
      guests: [],
      maxLength,
    })
    return entity
  }

  static join(queueEntity: Entity, guestEntity: Entity): boolean {
    const data = World.get(queueEntity, QueueComponent)
    if (!data) return false
    if (data.guests.length >= data.maxLength) return false
    data.guests.push(guestEntity)
    return true
  }

  static leave(queueEntity: Entity, guestEntity: Entity): void {
    const data = World.get(queueEntity, QueueComponent)
    if (!data) return
    const idx = data.guests.indexOf(guestEntity)
    if (idx !== -1) {
      data.guests.splice(idx, 1)
    }
  }

  static dequeue(queueEntity: Entity, count: number): Entity[] {
    const data = World.get(queueEntity, QueueComponent)
    if (!data) return []
    return data.guests.splice(0, count)
  }

  static length(queueEntity: Entity): number {
    const data = World.get(queueEntity, QueueComponent)
    return data?.guests.length ?? 0
  }

  static isFull(queueEntity: Entity): boolean {
    const data = World.get(queueEntity, QueueComponent)
    if (!data) return true
    return data.guests.length >= data.maxLength
  }

  static getBuilding(queueEntity: Entity): Entity | null {
    const data = World.get(queueEntity, QueueComponent)
    return data?.buildingEntity ?? null
  }
}
