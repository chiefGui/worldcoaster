import type { Entity } from './entity'
import type { ComponentId } from './component'
import { ComponentRegistry } from './component'

export type QueryId = number

export type QuerySchema = {
  readonly id: QueryId
  readonly with: readonly ComponentId[]
  readonly without?: readonly ComponentId[]
}

export class QueryManager {
  private static nextId: QueryId = 0
  private static readonly queries = new Map<QueryId, QuerySchema>()
  private static readonly cache = new Map<QueryId, Set<Entity>>()
  private static readonly dirty = new Set<QueryId>()
  private static readonly needsRebuild = new Set<QueryId>()
  private static readonly listeners = new Map<QueryId, Set<() => void>>()

  static create(withComponents: readonly ComponentId[], without?: readonly ComponentId[]): QuerySchema {
    const key = this.buildKey(withComponents, without)
    for (const [, schema] of this.queries) {
      if (this.buildKey(schema.with, schema.without) === key) {
        return schema
      }
    }
    const id = this.nextId++
    const schema = { id, with: withComponents, ...(without && { without }) } as QuerySchema
    this.queries.set(id, schema)
    this.cache.set(id, new Set())
    this.listeners.set(id, new Set())
    this.needsRebuild.add(id)
    return schema
  }

  private static buildKey(withIds: readonly ComponentId[], without?: readonly ComponentId[]): string {
    const w = [...withIds].sort().join(',')
    const wo = without ? [...without].sort().join(',') : ''
    return `${w}|${wo}`
  }

  static invalidate(entity: Entity): void {
    for (const [queryId, schema] of this.queries) {
      const cached = this.cache.get(queryId)!
      const matches = this.matches(entity, schema)
      const wasIn = cached.has(entity)
      if (matches && !wasIn) {
        cached.add(entity)
        this.dirty.add(queryId)
      } else if (!matches && wasIn) {
        cached.delete(entity)
        this.dirty.add(queryId)
      }
    }
  }

  static matches(entity: Entity, schema: QuerySchema): boolean {
    const mask = ComponentRegistry.getMask(entity)
    for (const id of schema.with) {
      if (!mask.has(id)) return false
    }
    if (schema.without) {
      for (const id of schema.without) {
        if (mask.has(id)) return false
      }
    }
    return true
  }

  static get(schema: QuerySchema): ReadonlySet<Entity> {
    if (this.needsRebuild.has(schema.id)) {
      this.rebuild(schema)
      this.needsRebuild.delete(schema.id)
    }
    return this.cache.get(schema.id) ?? new Set()
  }

  static rebuild(schema: QuerySchema): void {
    const cached = this.cache.get(schema.id)!
    cached.clear()
    for (const componentId of schema.with) {
      const store = ComponentRegistry.getAll({ id: componentId, name: '' })
      for (const entity of store.keys()) {
        if (this.matches(entity, schema)) {
          cached.add(entity)
        }
      }
      break
    }
  }

  static subscribe(schema: QuerySchema, fn: () => void): () => void {
    this.listeners.get(schema.id)!.add(fn)
    return () => this.listeners.get(schema.id)!.delete(fn)
  }

  static flushDirty(): void {
    for (const queryId of this.dirty) {
      this.listeners.get(queryId)?.forEach(fn => fn())
    }
    this.dirty.clear()
  }

  static removeEntity(entity: Entity): void {
    for (const cached of this.cache.values()) {
      cached.delete(entity)
    }
  }

  static clear(): void {
    this.cache.forEach(c => c.clear())
    this.dirty.clear()
    for (const id of this.queries.keys()) {
      this.needsRebuild.add(id)
    }
  }
}
