import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import type { StatId } from '../stat/stat.component'

// Modifier tags - for categorization and bulk operations
export const ModifierTag = {
  // Effect types
  buff: 'buff',
  debuff: 'debuff',
  neutral: 'neutral',

  // Sources
  consumable: 'consumable',
  equipment: 'equipment',
  environment: 'environment',
  weather: 'weather',
  event: 'event',

  // Removal categories
  cleansable: 'cleansable',
  permanent: 'permanent',
  transferable: 'transferable',
} as const

export type ModifierTagId = typeof ModifierTag[keyof typeof ModifierTag]

// Computation phases - order matters, extensible via registry
export type ModifierPhase =
  | 'base_add'      // Added to base value first
  | 'base_multiply' // Multiply the base
  | 'flat_add'      // Flat addition after base calc
  | 'percent_add'   // Additive percentage (stacks additively)
  | 'percent_multiply' // Multiplicative percentage (stacks multiplicatively)
  | 'final_add'     // Final flat addition
  | 'final_multiply' // Final multiplier
  | 'override'      // Completely override (highest priority wins)
  | 'min_clamp'     // Minimum value
  | 'max_clamp'     // Maximum value

// Core modifier data - every modifier entity has this
export type ModifierData = {
  targetEntity: Entity
  statId: StatId
  phase: ModifierPhase
  value: number
  priority: number // Within same phase, higher = later
  enabled: boolean
  source: string
  tags: string[]
}

export const ModifierComponent: ComponentSchema<ModifierData> = World.registerComponent<ModifierData>(
  'Modifier'
)

// Optional: Duration (modifier expires after time)
export type ModifierDurationData = {
  remaining: number
  initial: number
}

export const ModifierDurationComponent: ComponentSchema<ModifierDurationData> = World.registerComponent<ModifierDurationData>(
  'ModifierDuration'
)

// Optional: Stacking behavior
export type StackBehavior = 'refresh' | 'extend' | 'independent' | 'replace'

export type ModifierStackData = {
  current: number
  max: number
  behavior: StackBehavior
  valuePerStack: number // How much each stack adds to base value
}

export const ModifierStackComponent: ComponentSchema<ModifierStackData> = World.registerComponent<ModifierStackData>(
  'ModifierStack'
)

// Optional: Conditions (only applies when all conditions true)
export type ConditionCheck = {
  type: string
  params: Record<string, unknown>
}

export type ModifierConditionData = {
  conditions: ConditionCheck[]
}

export const ModifierConditionComponent: ComponentSchema<ModifierConditionData> = World.registerComponent<ModifierConditionData>(
  'ModifierCondition'
)

// Condition evaluator registry - extensible without touching core
export type ConditionEvaluator = (entity: Entity, params: Record<string, unknown>) => boolean

export class ConditionRegistry {
  private static readonly evaluators = new Map<string, ConditionEvaluator>()

  static register(type: string, evaluator: ConditionEvaluator): void {
    this.evaluators.set(type, evaluator)
  }

  static evaluate(entity: Entity, condition: ConditionCheck): boolean {
    const evaluator = this.evaluators.get(condition.type)
    return evaluator ? evaluator(entity, condition.params) : true
  }

  static evaluateAll(entity: Entity, conditions: ConditionCheck[]): boolean {
    for (const condition of conditions) {
      if (!this.evaluate(entity, condition)) return false
    }
    return true
  }
}

// Phase order for computation
const PHASE_ORDER: ModifierPhase[] = [
  'base_add',
  'base_multiply',
  'flat_add',
  'percent_add',
  'percent_multiply',
  'final_add',
  'final_multiply',
  'override',
  'min_clamp',
  'max_clamp',
]

// Read-only queries for modifiers
export class Modifier {
  private static modifierQuery = World.createQuery([ModifierComponent])

  static getForEntity(targetEntity: Entity): Entity[] {
    const result: Entity[] = []
    for (const modEntity of World.query(this.modifierQuery)) {
      const mod = World.get(modEntity, ModifierComponent)
      if (mod?.targetEntity === targetEntity) {
        result.push(modEntity)
      }
    }
    return result
  }

  static getForStat(targetEntity: Entity, statId: StatId): Entity[] {
    const result: Entity[] = []
    for (const modEntity of World.query(this.modifierQuery)) {
      const mod = World.get(modEntity, ModifierComponent)
      if (mod?.targetEntity === targetEntity && mod.statId === statId) {
        result.push(modEntity)
      }
    }
    return result
  }

  static getByTag(tag: string): Entity[] {
    const result: Entity[] = []
    for (const modEntity of World.query(this.modifierQuery)) {
      const mod = World.get(modEntity, ModifierComponent)
      if (mod?.tags.includes(tag)) {
        result.push(modEntity)
      }
    }
    return result
  }

  static getBySource(source: string): Entity[] {
    const result: Entity[] = []
    for (const modEntity of World.query(this.modifierQuery)) {
      const mod = World.get(modEntity, ModifierComponent)
      if (mod?.source === source) {
        result.push(modEntity)
      }
    }
    return result
  }

  static compute(targetEntity: Entity, statId: StatId, baseValue: number): number {
    const modifiers = this.getForStat(targetEntity, statId)
      .map(e => ({ entity: e, data: World.get(e, ModifierComponent)! }))
      .filter(m => m.data.enabled)
      .filter(m => {
        const cond = World.get(m.entity, ModifierConditionComponent)
        return !cond || ConditionRegistry.evaluateAll(targetEntity, cond.conditions)
      })
      .sort((a, b) => {
        const phaseA = PHASE_ORDER.indexOf(a.data.phase)
        const phaseB = PHASE_ORDER.indexOf(b.data.phase)
        if (phaseA !== phaseB) return phaseA - phaseB
        return a.data.priority - b.data.priority
      })

    let value = baseValue
    let percentAdditive = 0
    let overrideValue: number | null = null
    let minClamp = -Infinity
    let maxClamp = Infinity

    for (const { entity: modEntity, data: mod } of modifiers) {
      const stack = World.get(modEntity, ModifierStackComponent)
      const effectiveValue = stack
        ? mod.value + (stack.current - 1) * stack.valuePerStack
        : mod.value

      switch (mod.phase) {
        case 'base_add':
          value += effectiveValue
          break
        case 'base_multiply':
          value *= effectiveValue
          break
        case 'flat_add':
          value += effectiveValue
          break
        case 'percent_add':
          percentAdditive += effectiveValue
          break
        case 'percent_multiply':
          value *= (1 + effectiveValue)
          break
        case 'final_add':
          value += effectiveValue
          break
        case 'final_multiply':
          value *= effectiveValue
          break
        case 'override':
          if (overrideValue === null || mod.priority > 0) {
            overrideValue = effectiveValue
          }
          break
        case 'min_clamp':
          minClamp = Math.max(minClamp, effectiveValue)
          break
        case 'max_clamp':
          maxClamp = Math.min(maxClamp, effectiveValue)
          break
      }
    }

    // Apply percent_add after collecting all
    if (percentAdditive !== 0) {
      value *= (1 + percentAdditive)
    }

    // Override takes precedence
    if (overrideValue !== null) {
      value = overrideValue
    }

    // Clamps applied last
    return Math.max(minClamp, Math.min(maxClamp, value))
  }

  static clear(): void {
    // Clear is now just despawning all modifier entities
    for (const modEntity of World.query(this.modifierQuery)) {
      World.despawn(modEntity)
    }
  }
}
