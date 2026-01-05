import type { Entity } from '../entity'
import { EntityManager } from '../entity'
import { ComponentRegistry } from '../component'
import { Tag } from '../tag'
import { GameTime, type GameTimeState } from '../../framework/time'

export type SerializedEntity = {
  id: Entity
  components: Record<string, unknown>
}

export type SerializedWorld = {
  version: number
  timestamp: number
  entities: SerializedEntity[]
  tags: Record<string, string[]>
  gameTime: GameTimeState
}

export class WorldSerializer {
  private static readonly VERSION = 3

  static serialize(): SerializedWorld {
    const entities: SerializedEntity[] = []
    for (const entity of EntityManager.all()) {
      const mask = ComponentRegistry.getMask(entity)
      const components: Record<string, unknown> = {}
      for (const componentId of mask) {
        const schema = ComponentRegistry.getSchema(componentId)
        if (!schema) continue
        const data = ComponentRegistry.getAll(schema).get(entity)
        if (data !== undefined) {
          components[schema.name] = data
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
    for (const serialized of data.entities) {
      EntityManager.restore(serialized.id)
      for (const [componentName, componentData] of Object.entries(serialized.components)) {
        const schema = ComponentRegistry.getSchemaByName(componentName)
        if (!schema) {
          console.warn(`Unknown component "${componentName}" in save, skipping`)
          continue
        }
        ComponentRegistry.add(serialized.id, schema, componentData as Record<string, unknown>)
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
