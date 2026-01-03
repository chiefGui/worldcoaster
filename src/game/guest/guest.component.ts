import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { StatComponent, Stat } from '@framework/stat/stat.component'
import { ModifierComponent } from '@framework/modifier/modifier.component'

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
  static create(initialMoney = 100): Entity {
    const entity = World.spawn()
    World.add(entity, GuestComponent, {
      state: 'idle',
      targetEntity: null,
      rideTimeRemaining: 0,
    })
    World.add(entity, StatComponent, { values: {} })
    World.add(entity, ModifierComponent, { modifiers: [] })

    Stat.set(entity, 'money', initialMoney)
    Stat.set(entity, 'happiness', 50)
    Stat.set(entity, 'hunger', 0)

    return entity
  }

  static getState(entity: Entity): GuestState {
    const data = World.get(entity, GuestComponent)
    return data?.state ?? 'idle'
  }

  static setState(entity: Entity, state: GuestState, target: Entity | null = null): void {
    const data = World.get(entity, GuestComponent)
    if (data) {
      data.state = state
      data.targetEntity = target
    }
  }

  static getTarget(entity: Entity): Entity | null {
    const data = World.get(entity, GuestComponent)
    return data?.targetEntity ?? null
  }

  static setRideTime(entity: Entity, duration: number): void {
    const data = World.get(entity, GuestComponent)
    if (data) {
      data.rideTimeRemaining = duration
    }
  }

  static getRideTime(entity: Entity): number {
    const data = World.get(entity, GuestComponent)
    return data?.rideTimeRemaining ?? 0
  }

  static tickRide(entity: Entity, dt: number): boolean {
    const data = World.get(entity, GuestComponent)
    if (!data) return true
    data.rideTimeRemaining -= dt
    return data.rideTimeRemaining <= 0
  }

  static canAfford(entity: Entity, amount: number): boolean {
    return Stat.get(entity, 'money') >= amount
  }

  static pay(entity: Entity, amount: number): boolean {
    if (!this.canAfford(entity, amount)) return false
    Stat.add(entity, 'money', -amount)
    return true
  }
}
