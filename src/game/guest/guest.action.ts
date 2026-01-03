import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { EffectProcessor } from '@framework/effect'
import { StatComponent, Stat } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { GuestComponent, type GuestState } from './guest.component'

export type SpawnGuestParams = {
  initialMoney?: number
  source?: string
}

export type PayParams = {
  entity: Entity
  amount: number
  source: string
}

export type ChangeStateParams = {
  entity: Entity
  newState: GuestState
  target?: Entity | null
  source: string
}

export type StartRideParams = {
  entity: Entity
  buildingEntity: Entity
  duration: number
  source: string
}

export class GuestAction {
  static spawn({ initialMoney = 100, source = 'game' }: SpawnGuestParams = {}): Entity | null {
    const entity = World.spawn()
    World.add(entity, GuestComponent, {
      state: 'idle',
      targetEntity: null,
      rideTimeRemaining: 0,
    })
    World.add(entity, StatComponent, { values: {} })

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

    StatAction.set({ entity, statId: 'money', value: initialMoney, source })
    StatAction.set({ entity, statId: 'happiness', value: 50, source })
    StatAction.set({ entity, statId: 'hunger', value: 0, source })

    return entity
  }

  static pay({ entity, amount, source }: PayParams): boolean {
    const money = Stat.get(entity, 'money')
    if (money < amount) return false

    const effect = EffectProcessor.process<{ amount: number }>({
      type: 'guest:pay',
      entity,
      source,
      timestamp: 0,
      payload: { amount },
    })

    if (!effect) return false

    return StatAction.change({ entity, statId: 'money', delta: -effect.payload.amount, source })
  }

  static canAfford({ entity, amount }: { entity: Entity; amount: number }): boolean {
    return Stat.get(entity, 'money') >= amount
  }

  static changeState({ entity, newState, target = null, source }: ChangeStateParams): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return false

    const previousState = guest.state

    const effect = EffectProcessor.process<{ previousState: GuestState; newState: GuestState; target: Entity | null }>({
      type: 'guest:state-change',
      entity,
      source,
      timestamp: 0,
      payload: { previousState, newState, target },
    })

    if (!effect) return false

    guest.state = effect.payload.newState
    guest.targetEntity = effect.payload.target
    return true
  }

  static startRide({ entity, buildingEntity, duration, source }: StartRideParams): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return false

    guest.rideTimeRemaining = duration
    return this.changeState({ entity, newState: 'riding', target: buildingEntity, source })
  }

  static tickRide({ entity, dt }: { entity: Entity; dt: number }): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return true
    guest.rideTimeRemaining -= dt
    return guest.rideTimeRemaining <= 0
  }
}
