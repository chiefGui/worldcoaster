import type { Entity } from '@ecs/entity'
import { EffectProcessor, type StatChangePayload } from '../effect'
import { Stat } from './stat.component'

export type ChangeStatParams = {
  entity: Entity
  statId: string
  delta: number
  source: string
}

export type SetStatParams = {
  entity: Entity
  statId: string
  value: number
  source: string
}

export class StatAction {
  static change({ entity, statId, delta, source }: ChangeStatParams): boolean {
    const previousValue = Stat.get(entity, statId)
    const newValue = previousValue + delta

    const effect = EffectProcessor.process<StatChangePayload>({
      type: 'stat:change',
      entity,
      source,
      timestamp: 0,
      payload: { statId, previousValue, newValue, delta },
    })

    if (!effect) return false

    Stat.set(entity, statId, effect.payload.newValue)
    return true
  }

  static set({ entity, statId, value, source }: SetStatParams): boolean {
    const previousValue = Stat.get(entity, statId)
    return this.change({ entity, statId, delta: value - previousValue, source })
  }
}
