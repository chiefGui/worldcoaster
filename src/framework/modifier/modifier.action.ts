import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { EffectProcessor } from '../effect'
import {
  ModifierComponent,
  ModifierDurationComponent,
  ModifierStackComponent,
  ModifierConditionComponent,
  Modifier,
  type ModifierPhase,
  type StackBehavior,
  type ConditionCheck,
} from './modifier.component'
import type { StatId } from '../stat/stat.component'

export type ApplyModifierParams = {
  targetEntity: Entity
  statId: StatId
  phase: ModifierPhase
  value: number
  source: string
  priority?: number
  tags?: string[]
  duration?: number
  stacking?: {
    max: number
    behavior: StackBehavior
    valuePerStack: number
  }
  conditions?: ConditionCheck[]
}

export type RemoveModifierParams = {
  modifierEntity: Entity
  source: string
}

export type RemoveBySourceParams = {
  source: string
  targetEntity?: Entity
}

export type RemoveByTagParams = {
  tag: string
  targetEntity?: Entity
}

export class ModifierAction {
  static apply(params: ApplyModifierParams): Entity | null {
    const {
      targetEntity,
      statId,
      phase,
      value,
      source,
      priority = 0,
      tags = [],
      duration,
      stacking,
      conditions,
    } = params

    // Check for existing modifier with same source for stacking
    if (stacking) {
      const existing = Modifier.getBySource(source).find(e => {
        const mod = World.get(e, ModifierComponent)
        return mod?.targetEntity === targetEntity && mod.statId === statId
      })

      if (existing) {
        return this.handleStacking(existing, stacking, duration)
      }
    }

    const effect = EffectProcessor.process<{ targetEntity: Entity; statId: StatId; value: number }>({
      type: 'modifier:apply',
      entity: targetEntity,
      source,
      timestamp: 0,
      payload: { targetEntity, statId, value },
    })

    if (!effect) return null

    const modifierEntity = World.spawn()

    World.add(modifierEntity, ModifierComponent, {
      targetEntity,
      statId,
      phase,
      value: effect.payload.value,
      priority,
      enabled: true,
      source,
      tags,
    })

    if (duration !== undefined) {
      World.add(modifierEntity, ModifierDurationComponent, {
        remaining: duration,
        initial: duration,
      })
    }

    if (stacking) {
      World.add(modifierEntity, ModifierStackComponent, {
        current: 1,
        max: stacking.max,
        behavior: stacking.behavior,
        valuePerStack: stacking.valuePerStack,
      })
    }

    if (conditions && conditions.length > 0) {
      World.add(modifierEntity, ModifierConditionComponent, {
        conditions,
      })
    }

    return modifierEntity
  }

  private static handleStacking(
    existing: Entity,
    stacking: { max: number; behavior: StackBehavior; valuePerStack: number },
    duration?: number
  ): Entity {
    const stackData = World.get(existing, ModifierStackComponent)
    const durationData = World.get(existing, ModifierDurationComponent)

    if (stackData) {
      switch (stacking.behavior) {
        case 'refresh':
          // Refresh duration, don't add stacks beyond max
          if (stackData.current < stacking.max) {
            stackData.current++
          }
          if (durationData && duration !== undefined) {
            durationData.remaining = duration
          }
          break

        case 'extend':
          // Add to duration, add stacks
          if (stackData.current < stacking.max) {
            stackData.current++
          }
          if (durationData && duration !== undefined) {
            durationData.remaining += duration
          }
          break

        case 'replace':
          // Reset everything
          stackData.current = 1
          if (durationData && duration !== undefined) {
            durationData.remaining = duration
          }
          break

        case 'independent':
          // Don't stack - this shouldn't happen as we found existing
          break
      }
    }

    return existing
  }

  static remove({ modifierEntity, source }: RemoveModifierParams): boolean {
    const mod = World.get(modifierEntity, ModifierComponent)
    if (!mod) return false

    const effect = EffectProcessor.process<{ modifierEntity: Entity }>({
      type: 'modifier:remove',
      entity: mod.targetEntity,
      source,
      timestamp: 0,
      payload: { modifierEntity },
    })

    if (!effect) return false

    World.despawn(modifierEntity)
    return true
  }

  static removeBySource({ source, targetEntity }: RemoveBySourceParams): number {
    const modifiers = Modifier.getBySource(source)
    let removed = 0

    for (const modEntity of modifiers) {
      const mod = World.get(modEntity, ModifierComponent)
      if (targetEntity !== undefined && mod?.targetEntity !== targetEntity) {
        continue
      }
      if (this.remove({ modifierEntity: modEntity, source })) {
        removed++
      }
    }

    return removed
  }

  static removeByTag({ tag, targetEntity }: RemoveByTagParams): number {
    const modifiers = Modifier.getByTag(tag)
    let removed = 0

    for (const modEntity of modifiers) {
      const mod = World.get(modEntity, ModifierComponent)
      if (targetEntity !== undefined && mod?.targetEntity !== targetEntity) {
        continue
      }
      if (this.remove({ modifierEntity: modEntity, source: 'tag-removal' })) {
        removed++
      }
    }

    return removed
  }

  static setEnabled({ modifierEntity, enabled }: { modifierEntity: Entity; enabled: boolean }): boolean {
    const mod = World.get(modifierEntity, ModifierComponent)
    if (!mod) return false
    mod.enabled = enabled
    return true
  }

  static addStack({ modifierEntity, count = 1 }: { modifierEntity: Entity; count?: number }): boolean {
    const stack = World.get(modifierEntity, ModifierStackComponent)
    if (!stack) return false
    stack.current = Math.min(stack.max, stack.current + count)
    return true
  }

  static removeStack({ modifierEntity, count = 1 }: { modifierEntity: Entity; count?: number }): boolean {
    const stack = World.get(modifierEntity, ModifierStackComponent)
    if (!stack) return false
    stack.current = Math.max(0, stack.current - count)
    if (stack.current === 0) {
      World.despawn(modifierEntity)
    }
    return true
  }
}
