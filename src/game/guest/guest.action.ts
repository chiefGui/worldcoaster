import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { EffectProcessor } from '@framework/effect'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { GuestComponent, Guest, GuestState, GuestArchetype, GuestStat, type GuestStateId, type GuestArchetypeId } from './guest.component'

export type SpawnGuestParams = {
  archetype?: GuestArchetypeId
  source?: string
}

export type ChangeStateParams = {
  entity: Entity
  newState: GuestStateId
  target?: Entity | null
  source: string
}

export type StartRideParams = {
  entity: Entity
  buildingEntity: Entity
  duration: number
  source: string
}

const ARCHETYPES = Object.values(GuestArchetype)

function randomArchetype(): GuestArchetypeId {
  return ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)] as GuestArchetypeId
}

export class GuestAction {
  static spawn({ archetype, source = 'game' }: SpawnGuestParams = {}): Entity | null {
    const entity = World.spawn()
    World.add(entity, GuestComponent, {
      targetEntity: null,
      rideTimeRemaining: 0,
    })
    World.add(entity, StatComponent, { values: {} })
    Guest.setState(entity, GuestState.idle)
    Guest.setArchetype(entity, archetype ?? randomArchetype())

    const effect = EffectProcessor.process<Record<string, never>>({
      type: 'entity:spawn',
      entity,
      source,
      timestamp: 0,
      payload: {},
    })

    if (!effect) {
      World.despawn(entity)
      return null
    }

    StatAction.set({ entity, statId: GuestStat.happiness, value: 100, source })
    StatAction.set({ entity, statId: GuestStat.hunger, value: 100, source })
    StatAction.set({ entity, statId: GuestStat.thirst, value: 100, source })
    StatAction.set({ entity, statId: GuestStat.energy, value: 100, source })
    StatAction.set({ entity, statId: GuestStat.comfort, value: 100, source })

    return entity
  }

  static changeState({ entity, newState, target = null, source }: ChangeStateParams): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return false

    const previousState = Guest.state(entity)

    const effect = EffectProcessor.process<{ previousState: GuestStateId; newState: GuestStateId; target: Entity | null }>({
      type: 'guest:state-change',
      entity,
      source,
      timestamp: 0,
      payload: { previousState, newState, target },
    })

    if (!effect) return false

    Guest.setState(entity, effect.payload.newState)
    guest.targetEntity = effect.payload.target
    return true
  }

  static startRide({ entity, buildingEntity, duration, source }: StartRideParams): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return false

    guest.rideTimeRemaining = duration
    return this.changeState({ entity, newState: GuestState.riding, target: buildingEntity, source })
  }

  static tickRide({ entity, dt }: { entity: Entity; dt: number }): boolean {
    const guest = World.get(entity, GuestComponent)
    if (!guest) return true
    const wasPositive = guest.rideTimeRemaining > 0
    guest.rideTimeRemaining -= dt
    // Only return true once when transitioning from positive to non-positive
    return wasPositive && guest.rideTimeRemaining <= 0
  }
}
