import type { Entity } from './entity'
import type { ComponentId } from './component'

export const EcsEvent = {
  ENTITY_CREATED: 'ecs:entity:created',
  ENTITY_DESTROYED: 'ecs:entity:destroyed',
  COMPONENT_ADDED: 'ecs:component:added',
  COMPONENT_REMOVED: 'ecs:component:removed',
  WORLD_STARTED: 'ecs:world:started',
  WORLD_STOPPED: 'ecs:world:stopped',
  WORLD_TICK: 'ecs:world:tick',
} as const

export type EcsEventType = (typeof EcsEvent)[keyof typeof EcsEvent]

export type EcsEventPayload = {
  [EcsEvent.ENTITY_CREATED]: Entity
  [EcsEvent.ENTITY_DESTROYED]: Entity
  [EcsEvent.COMPONENT_ADDED]: { entity: Entity; component: ComponentId }
  [EcsEvent.COMPONENT_REMOVED]: { entity: Entity; component: ComponentId }
  [EcsEvent.WORLD_STARTED]: null
  [EcsEvent.WORLD_STOPPED]: null
  [EcsEvent.WORLD_TICK]: { dt: number }
}

export type Listener<T> = (data: T) => void
export type Unsubscribe = () => void

export class EventBus {
  private static readonly listeners = new Map<string, Set<Listener<unknown>>>()
  private static readonly queue: Array<{ event: string; data: unknown }> = []
  private static batching = false

  static on<K extends EcsEventType>(event: K, listener: Listener<EcsEventPayload[K]>): Unsubscribe
  static on<T = unknown>(event: string, listener: Listener<T>): Unsubscribe
  static on(event: string, listener: Listener<unknown>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return () => this.listeners.get(event)?.delete(listener)
  }

  static emit<K extends EcsEventType>(event: K, data: EcsEventPayload[K]): void
  static emit<T = unknown>(event: string, data: T): void
  static emit(event: string, data: unknown): void {
    if (this.batching) {
      this.queue.push({ event, data })
      return
    }
    this.dispatch(event, data)
  }

  private static dispatch(event: string, data: unknown): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const listener of set) {
      listener(data)
    }
  }

  static startBatch(): void {
    this.batching = true
  }

  static endBatch(): void {
    this.batching = false
    for (let i = 0; i < this.queue.length; i++) {
      const { event, data } = this.queue[i]!
      this.dispatch(event, data)
    }
    this.queue.length = 0
  }

  static clear(): void {
    this.listeners.clear()
    this.queue.length = 0
    this.batching = false
  }
}
