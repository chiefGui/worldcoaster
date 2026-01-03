import type { Entity } from './entity'
import type { ComponentData, ComponentSchema } from './component'
import type { QuerySchema } from './query'
import type { SystemFn } from './system'
import { EntityManager } from './entity'
import { ComponentRegistry } from './component'
import { QueryManager } from './query'
import { SystemManager } from './system'
import { EventBus, EcsEvent } from './event'

export class World {
  private static running = false
  private static lastTime = 0
  private static frameId = 0
  private static readonly componentChangeQueue: Entity[] = []

  static spawn(): Entity {
    const entity = EntityManager.create()
    EventBus.emit(EcsEvent.ENTITY_CREATED, entity)
    return entity
  }

  static despawn(entity: Entity): void {
    if (!EntityManager.isAlive(entity)) return
    QueryManager.removeEntity(entity)
    ComponentRegistry.clearEntity(entity)
    EntityManager.destroy(entity)
    EventBus.emit(EcsEvent.ENTITY_DESTROYED, entity)
  }

  static add<T extends ComponentData>(entity: Entity, schema: ComponentSchema<T>, data: T): void {
    ComponentRegistry.add(entity, schema, data)
    this.componentChangeQueue.push(entity)
    EventBus.emit(EcsEvent.COMPONENT_ADDED, { entity, component: schema.id })
  }

  static remove(entity: Entity, schema: ComponentSchema): void {
    ComponentRegistry.remove(entity, schema)
    this.componentChangeQueue.push(entity)
    EventBus.emit(EcsEvent.COMPONENT_REMOVED, { entity, component: schema.id })
  }

  static get<T extends ComponentData>(entity: Entity, schema: ComponentSchema<T>): T | undefined {
    return ComponentRegistry.get(entity, schema)
  }

  static has(entity: Entity, schema: ComponentSchema): boolean {
    return ComponentRegistry.has(entity, schema)
  }

  static query(schema: QuerySchema): ReadonlySet<Entity> {
    return QueryManager.get(schema)
  }

  static createQuery(withSchemas: readonly ComponentSchema[], without?: readonly ComponentSchema[]): QuerySchema {
    const withIds = withSchemas.map(s => s.id)
    const withoutIds = without?.map(s => s.id)
    return QueryManager.create(withIds, withoutIds)
  }

  static registerSystem(name: string, fn: SystemFn, after: readonly string[] = []): void {
    SystemManager.register(name, fn, after)
  }

  static registerComponent<T extends ComponentData>(name: string, defaultFn?: () => T): ComponentSchema<T> {
    return ComponentRegistry.register(name, defaultFn)
  }

  static start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    EventBus.emit(EcsEvent.WORLD_STARTED, null)
    this.loop()
  }

  static stop(): void {
    this.running = false
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = 0
    }
    EventBus.emit(EcsEvent.WORLD_STOPPED, null)
  }

  private static loop = (): void => {
    if (!this.running) return
    const now = performance.now()
    const dt = (now - this.lastTime) / 1000
    this.lastTime = now
    this.tick(dt)
    this.frameId = requestAnimationFrame(this.loop)
  }

  static tick(dt: number): void {
    EventBus.startBatch()
    for (let i = 0; i < this.componentChangeQueue.length; i++) {
      QueryManager.invalidate(this.componentChangeQueue[i]!)
    }
    this.componentChangeQueue.length = 0
    SystemManager.run(dt)
    QueryManager.flushDirty()
    EventBus.endBatch()
  }

  static clear(): void {
    this.stop()
    EntityManager.clear()
    ComponentRegistry.clear()
    QueryManager.clear()
    SystemManager.clear()
    EventBus.clear()
    this.componentChangeQueue.length = 0
  }

  static entityCount(): number {
    return EntityManager.count()
  }

  static isRunning(): boolean {
    return this.running
  }
}
