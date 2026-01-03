import { World } from '@ecs/world'
import { Tag } from '@ecs/tag'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { Stat } from '@framework/stat/stat.component'

// Guest stats - symmetrical keys (key === value)
export const GuestStat = {
  money: 'money',
  happiness: 'happiness',
  hunger: 'hunger',
  thirst: 'thirst',
  energy: 'energy',
  nausea: 'nausea',
} as const

export type GuestStatId = typeof GuestStat[keyof typeof GuestStat]

// Guest state tags - mutually exclusive
export const GuestState = {
  idle: 'guest:idle',
  walking: 'guest:walking',
  queuing: 'guest:queuing',
  riding: 'guest:riding',
  leaving: 'guest:leaving',
} as const

export type GuestStateId = typeof GuestState[keyof typeof GuestState]

const ALL_GUEST_STATES = Object.values(GuestState)

export type GuestData = {
  targetEntity: Entity | null
  rideTimeRemaining: number
}

export const GuestComponent: ComponentSchema<GuestData> = World.registerComponent<GuestData>(
  'Guest',
  () => ({ targetEntity: null, rideTimeRemaining: 0 })
)

export class Guest {
  static get(entity: Entity): GuestData | undefined {
    return World.get(entity, GuestComponent)
  }

  static state(entity: Entity): GuestStateId {
    for (const state of ALL_GUEST_STATES) {
      if (Tag.has(entity, state)) return state
    }
    return GuestState.idle
  }

  static is(entity: Entity, state: GuestStateId): boolean {
    return Tag.has(entity, state)
  }

  static setState(entity: Entity, state: GuestStateId): void {
    Tag.set(entity, state, ALL_GUEST_STATES)
  }

  static target(entity: Entity): Entity | null {
    return World.get(entity, GuestComponent)?.targetEntity ?? null
  }

  static rideTimeRemaining(entity: Entity): number {
    return World.get(entity, GuestComponent)?.rideTimeRemaining ?? 0
  }

  static canAfford(entity: Entity, amount: number): boolean {
    return Stat.get(entity, GuestStat.money) >= amount
  }
}
