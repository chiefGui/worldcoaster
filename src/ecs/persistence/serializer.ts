import type { Entity } from '../entity'
import type { ComponentId } from '../component'
import { EntityManager } from '../entity'
import { ComponentRegistry } from '../component'
import { Tag } from '../tag'
import { GameTime } from '../../framework/time'

export type SerializedEntity = {
  id: Entity
  components: Record<ComponentId, unknown>
}

export type SerializedWorld = {
  version: number
  timestamp: number
  entities: SerializedEntity[]
  tags: Record<string, string[]>
  gameTime: { elapsed: number; day: number; paused: boolean }
}

export class WorldSerializer {
  private static readonly VERSION = 1

  static serialize(): SerializedWorld {
    const entities: SerializedEntity[] = []
    for (const entity of EntityManager.all()) {
      const mask = ComponentRegistry.getMask(entity)
      const components: Record<number, unknown> = {}
      for (const componentId of mask) {
        const data = ComponentRegistry.getAll({ id: componentId, name: '' }).get(entity)
        if (data !== undefined) {
          components[componentId] = data
        }
      }
      entities.push({ id: entity, components })
    }
    return {
      version: this.VERSION,
      timestamp: Date.now(),
      entities,
      tags: Tag.serialize(),
      gameTime: GameTime.getState(),
    }
  }

  static deserialize(data: SerializedWorld): void {
    if (data.version !== this.VERSION) {
      console.warn(`Save version mismatch: ${data.version} vs ${this.VERSION}`)
    }
    for (const serialized of data.entities) {
      EntityManager.restore(serialized.id)
      for (const [componentIdStr, componentData] of Object.entries(serialized.components)) {
        const componentId = Number(componentIdStr)
        ComponentRegistry.add(serialized.id, { id: componentId, name: '' }, componentData as Record<string, unknown>)
      }
    }
    if (data.tags) {
      Tag.deserialize(data.tags)
    }
    if (data.gameTime) {
      GameTime.setState(data.gameTime)
    }
  }
}
