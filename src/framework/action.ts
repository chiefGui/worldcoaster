import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { Stat } from './stat/stat.component'
import { Guest, type GuestState } from '@game/guest/guest.component'
import { EffectProcessor, type StatChangePayload } from './effect'

export class Action {
  static changeStat(entity: Entity, statId: string, delta: number, source: string): boolean {
    const previousValue = Stat.get(entity, statId)
    const newValue = previousValue + delta

    const effect = EffectProcessor.process<StatChangePayload>({
      type: 'stat:change',
      entity,
      source,
      timestamp: 0,
      payload: {
        statId,
        previousValue,
        newValue,
        delta,
      },
    })

    if (!effect) return false

    Stat.set(entity, statId, effect.payload.newValue)
    return true
  }

  static setStat(entity: Entity, statId: string, value: number, source: string): boolean {
    const previousValue = Stat.get(entity, statId)
    return this.changeStat(entity, statId, value - previousValue, source)
  }

  static guestPay(guestEntity: Entity, amount: number, source: string): boolean {
    if (!Guest.canAfford(guestEntity, amount)) return false

    const effect = EffectProcessor.process<{ amount: number }>({
      type: 'guest:pay',
      entity: guestEntity,
      source,
      timestamp: 0,
      payload: { amount },
    })

    if (!effect) return false

    return this.changeStat(guestEntity, 'money', -effect.payload.amount, source)
  }

  static guestStateChange(guestEntity: Entity, newState: GuestState, target: Entity | null, source: string): boolean {
    const previousState = Guest.getState(guestEntity)

    const effect = EffectProcessor.process<{ previousState: GuestState; newState: GuestState; target: Entity | null }>({
      type: 'guest:state-change',
      entity: guestEntity,
      source,
      timestamp: 0,
      payload: { previousState, newState, target },
    })

    if (!effect) return false

    Guest.setState(guestEntity, effect.payload.newState, effect.payload.target)
    return true
  }

  static spawnGuest(initialMoney: number, source: string): Entity | null {
    const entity = Guest.create(initialMoney)

    const effect = EffectProcessor.process<{ initialMoney: number }>({
      type: 'entity:spawn',
      entity,
      source,
      timestamp: 0,
      payload: { initialMoney },
    })

    if (!effect) {
      World.despawn(entity)
      return null
    }

    return entity
  }

  static despawnEntity(entity: Entity, source: string): boolean {
    const effect = EffectProcessor.process<Record<string, never>>({
      type: 'entity:despawn',
      entity,
      source,
      timestamp: 0,
      payload: {},
    })

    if (!effect) return false

    World.despawn(entity)
    return true
  }
}
