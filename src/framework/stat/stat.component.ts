import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { Modifier } from '../modifier/modifier.component'

export type StatId = string

export type StatData = {
  values: Record<StatId, number>
}

export const StatComponent: ComponentSchema<StatData> = World.registerComponent<StatData>(
  'Stat',
  () => ({ values: {} })
)

export class Stat {
  static get(entity: Entity, statId: StatId): number {
    const data = World.get(entity, StatComponent)
    return data?.values[statId] ?? 0
  }

  static getFinal(entity: Entity, statId: StatId): number {
    const base = this.get(entity, statId)
    return Modifier.compute(entity, statId, base)
  }

  static set(entity: Entity, statId: StatId, value: number): void {
    const data = World.get(entity, StatComponent)
    if (data) {
      data.values[statId] = value
    }
  }

  static add(entity: Entity, statId: StatId, delta: number): void {
    const current = this.get(entity, statId)
    this.set(entity, statId, current + delta)
  }

  static has(entity: Entity, statId: StatId): boolean {
    const data = World.get(entity, StatComponent)
    return data?.values[statId] !== undefined
  }

  static all(entity: Entity): Readonly<Record<StatId, number>> {
    const data = World.get(entity, StatComponent)
    return data?.values ?? {}
  }

  static allFinal(entity: Entity): Record<StatId, number> {
    const base = this.all(entity)
    const result: Record<StatId, number> = {}
    for (const statId in base) {
      result[statId] = this.getFinal(entity, statId)
    }
    return result
  }
}
