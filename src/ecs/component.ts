import type { Entity } from './entity'

export type ComponentId = number

export type ComponentData = Record<string, unknown>

export type ComponentSchema<T extends ComponentData = ComponentData> = {
  readonly id: ComponentId
  readonly name: string
  readonly default?: () => T
}

export class ComponentRegistry {
  private static nextId: ComponentId = 0
  private static readonly schemas = new Map<ComponentId, ComponentSchema>()
  private static readonly nameToId = new Map<string, ComponentId>()
  private static readonly storage = new Map<ComponentId, Map<Entity, ComponentData>>()
  private static readonly entityMasks = new Map<Entity, Set<ComponentId>>()
  private static readonly onAdd = new Map<ComponentId, Set<(entity: Entity) => void>>()
  private static readonly onRemove = new Map<ComponentId, Set<(entity: Entity) => void>>()

  static register<T extends ComponentData>(name: string, defaultFn?: () => T): ComponentSchema<T> {
    if (this.nameToId.has(name)) {
      return this.schemas.get(this.nameToId.get(name)!)! as ComponentSchema<T>
    }
    const id = this.nextId++
    const schema = { id, name, ...(defaultFn && { default: defaultFn }) } as ComponentSchema<T>
    this.schemas.set(id, schema as ComponentSchema)
    this.nameToId.set(name, id)
    this.storage.set(id, new Map())
    this.onAdd.set(id, new Set())
    this.onRemove.set(id, new Set())
    return schema
  }

  static getId(name: string): ComponentId | undefined {
    return this.nameToId.get(name)
  }

  static getSchema(id: ComponentId): ComponentSchema | undefined {
    return this.schemas.get(id)
  }

  static getSchemaByName(name: string): ComponentSchema | undefined {
    const id = this.nameToId.get(name)
    return id !== undefined ? this.schemas.get(id) : undefined
  }

  static add<T extends ComponentData>(entity: Entity, schema: ComponentSchema<T>, data: T): void {
    const store = this.storage.get(schema.id)!
    store.set(entity, data)
    if (!this.entityMasks.has(entity)) {
      this.entityMasks.set(entity, new Set())
    }
    this.entityMasks.get(entity)!.add(schema.id)
    this.onAdd.get(schema.id)!.forEach(fn => fn(entity))
  }

  static remove(entity: Entity, schema: ComponentSchema): void {
    const store = this.storage.get(schema.id)
    if (!store?.has(entity)) return
    this.onRemove.get(schema.id)!.forEach(fn => fn(entity))
    store.delete(entity)
    this.entityMasks.get(entity)?.delete(schema.id)
  }

  static get<T extends ComponentData>(entity: Entity, schema: ComponentSchema<T>): T | undefined {
    return this.storage.get(schema.id)?.get(entity) as T | undefined
  }

  static has(entity: Entity, schema: ComponentSchema): boolean {
    return this.storage.get(schema.id)?.has(entity) ?? false
  }

  static getMask(entity: Entity): ReadonlySet<ComponentId> {
    return this.entityMasks.get(entity) ?? new Set()
  }

  static getAll<T extends ComponentData>(schema: ComponentSchema<T>): ReadonlyMap<Entity, T> {
    return this.storage.get(schema.id) as Map<Entity, T> ?? new Map()
  }

  static subscribeAdd(schema: ComponentSchema, fn: (entity: Entity) => void): () => void {
    this.onAdd.get(schema.id)!.add(fn)
    return () => this.onAdd.get(schema.id)!.delete(fn)
  }

  static subscribeRemove(schema: ComponentSchema, fn: (entity: Entity) => void): () => void {
    this.onRemove.get(schema.id)!.add(fn)
    return () => this.onRemove.get(schema.id)!.delete(fn)
  }

  static clearEntity(entity: Entity): void {
    const mask = this.entityMasks.get(entity)
    if (!mask) return
    for (const componentId of mask) {
      this.onRemove.get(componentId)!.forEach(fn => fn(entity))
      this.storage.get(componentId)!.delete(entity)
    }
    this.entityMasks.delete(entity)
  }

  static clear(): void {
    this.storage.forEach(store => store.clear())
    this.entityMasks.clear()
  }
}
