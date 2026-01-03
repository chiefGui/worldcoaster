import { World } from '@ecs/world'
import type { ComponentSchema } from '@ecs/component'

export type StatId = string

export type StatData = {
  values: Record<StatId, number>
}

export const StatComponent: ComponentSchema<StatData> = World.registerComponent<StatData>(
  'Stat',
  () => ({ values: {} })
)

export class Stat {
  static get(entity: number, statId: StatId): number {
    const data = World.get(entity, StatComponent)
    return data?.values[statId] ?? 0
  }

  static set(entity: number, statId: StatId, value: number): void {
    const data = World.get(entity, StatComponent)
    if (data) {
      data.values[statId] = value
    }
  }

  static add(entity: number, statId: StatId, delta: number): void {
    const current = this.get(entity, statId)
    this.set(entity, statId, current + delta)
  }

  static has(entity: number, statId: StatId): boolean {
    const data = World.get(entity, StatComponent)
    return data?.values[statId] !== undefined
  }

  static all(entity: number): Readonly<Record<StatId, number>> {
    const data = World.get(entity, StatComponent)
    return data?.values ?? {}
  }
}
