import type { Entity } from '../entity'
import type { ComponentId } from '../component'
import { EntityManager } from '../entity'
import { ComponentRegistry } from '../component'

export type SerializedEntity = {
  id: Entity
  components: Record<ComponentId, unknown>
}

export type SerializedWorld = {
  version: number
  timestamp: number
  entities: SerializedEntity[]
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
    }
  }

  static deserialize(data: SerializedWorld): void {
    if (data.version !== this.VERSION) {
      console.warn(`Save version mismatch: ${data.version} vs ${this.VERSION}`)
    }
    for (const serialized of data.entities) {
      const entity = EntityManager.create()
      if (entity !== serialized.id) {
        console.warn(`Entity ID mismatch during load: ${entity} vs ${serialized.id}`)
      }
      for (const [componentIdStr, componentData] of Object.entries(serialized.components)) {
        const componentId = Number(componentIdStr)
        ComponentRegistry.add(entity, { id: componentId, name: '' }, componentData as Record<string, unknown>)
      }
    }
  }
}
