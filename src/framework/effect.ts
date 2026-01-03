import type { Entity } from '@ecs/entity'
import type { Unsubscribe } from '@ecs/event'

export type EffectType =
  | 'stat:change'
  | 'entity:spawn'
  | 'entity:despawn'
  | 'guest:state-change'
  | 'guest:pay'
  | 'guest:ride-complete'
  | 'building:built'
  | 'queue:join'
  | 'queue:leave'

export type Effect<T = unknown> = {
  type: EffectType
  entity: Entity
  source: string
  timestamp: number
  payload: T
}

export type StatChangePayload = {
  statId: string
  previousValue: number
  newValue: number
  delta: number
}

export type BeforeHandler<T = unknown> = (effect: Effect<T>) => Effect<T> | null
export type AfterHandler<T = unknown> = (effect: Effect<T>) => void

export class EffectProcessor {
  private static readonly beforeHandlers = new Map<EffectType, Set<BeforeHandler>>()
  private static readonly afterHandlers = new Map<EffectType, Set<AfterHandler>>()
  private static readonly wildcardBefore = new Set<BeforeHandler>()
  private static readonly wildcardAfter = new Set<AfterHandler>()
  private static readonly history: Effect[] = []
  private static readonly MAX_HISTORY = 10000
  private static historyEnabled = true

  static process<T>(effect: Effect<T>): Effect<T> | null {
    let current: Effect<T> | null = { ...effect, timestamp: Date.now() }

    for (const handler of this.wildcardBefore) {
      if (!current) break
      current = handler(current) as Effect<T> | null
    }

    const beforeSet = this.beforeHandlers.get(effect.type)
    if (beforeSet && current) {
      for (const handler of beforeSet) {
        if (!current) break
        current = handler(current) as Effect<T> | null
      }
    }

    if (!current) return null

    if (this.historyEnabled) {
      this.history.push(current as Effect)
      if (this.history.length > this.MAX_HISTORY) {
        this.history.shift()
      }
    }

    const afterSet = this.afterHandlers.get(effect.type)
    if (afterSet) {
      for (const handler of afterSet) {
        handler(current)
      }
    }

    for (const handler of this.wildcardAfter) {
      handler(current)
    }

    return current
  }

  static onBefore<T = unknown>(type: EffectType | '*', handler: BeforeHandler<T>): Unsubscribe {
    if (type === '*') {
      this.wildcardBefore.add(handler as BeforeHandler)
      return () => this.wildcardBefore.delete(handler as BeforeHandler)
    }
    if (!this.beforeHandlers.has(type)) {
      this.beforeHandlers.set(type, new Set())
    }
    this.beforeHandlers.get(type)!.add(handler as BeforeHandler)
    return () => this.beforeHandlers.get(type)?.delete(handler as BeforeHandler)
  }

  static onAfter<T = unknown>(type: EffectType | '*', handler: AfterHandler<T>): Unsubscribe {
    if (type === '*') {
      this.wildcardAfter.add(handler as AfterHandler)
      return () => this.wildcardAfter.delete(handler as AfterHandler)
    }
    if (!this.afterHandlers.has(type)) {
      this.afterHandlers.set(type, new Set())
    }
    this.afterHandlers.get(type)!.add(handler as AfterHandler)
    return () => this.afterHandlers.get(type)?.delete(handler as AfterHandler)
  }

  static query<T = unknown>(filter: {
    type?: EffectType
    entity?: Entity
    source?: string
    since?: number
  }): readonly Effect<T>[] {
    return this.history.filter(effect => {
      if (filter.type && effect.type !== filter.type) return false
      if (filter.entity !== undefined && effect.entity !== filter.entity) return false
      if (filter.source && effect.source !== filter.source) return false
      if (filter.since && effect.timestamp < filter.since) return false
      return true
    }) as Effect<T>[]
  }

  static queryStat(statId: string, options?: {
    entity?: Entity
    source?: string
    since?: number
  }): readonly Effect<StatChangePayload>[] {
    return this.query<StatChangePayload>({
      type: 'stat:change',
      ...options,
    }).filter(e => e.payload.statId === statId)
  }

  static sumStatChanges(statId: string, options?: {
    entity?: Entity
    source?: string
    since?: number
  }): number {
    return this.queryStat(statId, options).reduce((sum, e) => sum + e.payload.delta, 0)
  }

  static getSourcesFor(statId: string, entity?: Entity): readonly string[] {
    const sources = new Set<string>()
    const options = entity !== undefined ? { entity } : undefined
    for (const effect of this.queryStat(statId, options)) {
      sources.add(effect.source)
    }
    return Array.from(sources)
  }

  static setHistoryEnabled(enabled: boolean): void {
    this.historyEnabled = enabled
  }

  static clearHistory(): void {
    this.history.length = 0
  }

  static clear(): void {
    this.beforeHandlers.clear()
    this.afterHandlers.clear()
    this.wildcardBefore.clear()
    this.wildcardAfter.clear()
    this.history.length = 0
  }
}
