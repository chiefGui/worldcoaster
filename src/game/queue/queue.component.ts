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
  static get(entity: Entity): QueueData | undefined {
    return World.get(entity, QueueComponent)
  }

  static isFull(entity: Entity): boolean {
    const queue = World.get(entity, QueueComponent)
    if (!queue) return true
    return queue.guests.length >= queue.maxLength
  }

  static length(entity: Entity): number {
    const queue = World.get(entity, QueueComponent)
    return queue?.guests.length ?? 0
  }

  static building(entity: Entity): Entity | null {
    const queue = World.get(entity, QueueComponent)
    return queue?.buildingEntity ?? null
  }

  static guests(entity: Entity): readonly Entity[] {
    const queue = World.get(entity, QueueComponent)
    return queue?.guests ?? []
  }
}
