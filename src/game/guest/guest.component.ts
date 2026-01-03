import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { Stat } from '@framework/stat/stat.component'

// Guest stats - colocated with domain
export const GuestStat = {
  MONEY: 'money',
  HAPPINESS: 'happiness',
  HUNGER: 'hunger',
  THIRST: 'thirst',
  ENERGY: 'energy',
  NAUSEA: 'nausea',
} as const

export type GuestStatId = typeof GuestStat[keyof typeof GuestStat]

export type GuestState = 'idle' | 'walking' | 'queuing' | 'riding' | 'leaving'

export type GuestData = {
  state: GuestState
  targetEntity: Entity | null
  rideTimeRemaining: number
}

export const GuestComponent: ComponentSchema<GuestData> = World.registerComponent<GuestData>(
  'Guest',
  () => ({ state: 'idle', targetEntity: null, rideTimeRemaining: 0 })
)

export class Guest {
  static get(entity: Entity): GuestData | undefined {
    return World.get(entity, GuestComponent)
  }

  static state(entity: Entity): GuestState {
    const guest = World.get(entity, GuestComponent)
    return guest?.state ?? 'idle'
  }

  static target(entity: Entity): Entity | null {
    const guest = World.get(entity, GuestComponent)
    return guest?.targetEntity ?? null
  }

  static rideTimeRemaining(entity: Entity): number {
    const guest = World.get(entity, GuestComponent)
    return guest?.rideTimeRemaining ?? 0
  }

  static canAfford(entity: Entity, amount: number): boolean {
    return Stat.get(entity, GuestStat.MONEY) >= amount
  }
}
