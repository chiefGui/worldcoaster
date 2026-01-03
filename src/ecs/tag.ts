import type { Entity } from './entity'

// Entity tag storage - lightweight alternative to marker components
const entityTags = new Map<Entity, Set<string>>()
const tagEntities = new Map<string, Set<Entity>>()
const onTagAdd = new Map<string, Set<(entity: Entity) => void>>()
const onTagRemove = new Map<string, Set<(entity: Entity) => void>>()

export class Tag {
  static add(entity: Entity, tag: string): void {
    if (!entityTags.has(entity)) {
      entityTags.set(entity, new Set())
    }
    const tags = entityTags.get(entity)!
    if (tags.has(tag)) return

    tags.add(tag)

    if (!tagEntities.has(tag)) {
      tagEntities.set(tag, new Set())
    }
    tagEntities.get(tag)!.add(entity)

    onTagAdd.get(tag)?.forEach(fn => fn(entity))
  }

  static remove(entity: Entity, tag: string): void {
    const tags = entityTags.get(entity)
    if (!tags?.has(tag)) return

    onTagRemove.get(tag)?.forEach(fn => fn(entity))
    tags.delete(tag)
    tagEntities.get(tag)?.delete(entity)
  }

  static has(entity: Entity, tag: string): boolean {
    return entityTags.get(entity)?.has(tag) ?? false
  }

  static all(entity: Entity): ReadonlySet<string> {
    return entityTags.get(entity) ?? new Set()
  }

  static entities(tag: string): ReadonlySet<Entity> {
    return tagEntities.get(tag) ?? new Set()
  }

  static set(entity: Entity, tag: string, exclusive?: string[]): void {
    // Remove any exclusive tags first
    if (exclusive) {
      for (const t of exclusive) {
        if (t !== tag) this.remove(entity, t)
      }
    }
    this.add(entity, tag)
  }

  static subscribeAdd(tag: string, fn: (entity: Entity) => void): () => void {
    if (!onTagAdd.has(tag)) onTagAdd.set(tag, new Set())
    onTagAdd.get(tag)!.add(fn)
    return () => onTagAdd.get(tag)!.delete(fn)
  }

  static subscribeRemove(tag: string, fn: (entity: Entity) => void): () => void {
    if (!onTagRemove.has(tag)) onTagRemove.set(tag, new Set())
    onTagRemove.get(tag)!.add(fn)
    return () => onTagRemove.get(tag)!.delete(fn)
  }

  static clearEntity(entity: Entity): void {
    const tags = entityTags.get(entity)
    if (!tags) return
    for (const tag of tags) {
      onTagRemove.get(tag)?.forEach(fn => fn(entity))
      tagEntities.get(tag)?.delete(entity)
    }
    entityTags.delete(entity)
  }

  static clear(): void {
    entityTags.clear()
    tagEntities.clear()
  }

  static serialize(): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    for (const [entity, tags] of entityTags) {
      result[String(entity)] = Array.from(tags)
    }
    return result
  }

  static deserialize(data: Record<string, string[]>): void {
    for (const [entityStr, tags] of Object.entries(data)) {
      const entity = Number(entityStr)
      for (const tag of tags) {
        this.add(entity, tag)
      }
    }
  }
}
