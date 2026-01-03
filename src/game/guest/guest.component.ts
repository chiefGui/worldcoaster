import { World } from '@ecs/world'
import { Tag } from '@ecs/tag'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

// Guest stats - symmetrical keys (key === value)
export const GuestStat = {
  happiness: 'happiness',
  hunger: 'hunger',
  thirst: 'thirst',
  energy: 'energy',
  comfort: 'comfort',
} as const

export type GuestStatId = (typeof GuestStat)[keyof typeof GuestStat]

// Guest state tags - mutually exclusive
export const GuestState = {
  idle: 'guest:idle',
  walking: 'guest:walking',
  queuing: 'guest:queuing',
  riding: 'guest:riding',
  leaving: 'guest:leaving',
} as const

export type GuestStateId = (typeof GuestState)[keyof typeof GuestState]

// Guest archetype tags
export const GuestArchetype = {
  thrillSeeker: 'guest:thrill-seeker',
  bigSpender: 'guest:big-spender',
  casual: 'guest:casual',
  family: 'guest:family',
} as const

export type GuestArchetypeId = (typeof GuestArchetype)[keyof typeof GuestArchetype]

const ALL_GUEST_STATES = Object.values(GuestState)
const ALL_GUEST_ARCHETYPES = Object.values(GuestArchetype)

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

  static archetype(entity: Entity): GuestArchetypeId | null {
    for (const archetype of ALL_GUEST_ARCHETYPES) {
      if (Tag.has(entity, archetype)) return archetype
    }
    return null
  }

  static setArchetype(entity: Entity, archetype: GuestArchetypeId): void {
    Tag.set(entity, archetype, ALL_GUEST_ARCHETYPES)
  }

  static target(entity: Entity): Entity | null {
    return World.get(entity, GuestComponent)?.targetEntity ?? null
  }

  static rideTimeRemaining(entity: Entity): number {
    return World.get(entity, GuestComponent)?.rideTimeRemaining ?? 0
  }
}
