import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import type { StatId } from '../stat/stat.component'

export type ModifierOperation = 'add' | 'multiply'

export type ModifierEntry = {
  statId: StatId
  operation: ModifierOperation
  value: number
  source?: string
}

export type ModifierData = {
  modifiers: ModifierEntry[]
}

export const ModifierComponent: ComponentSchema<ModifierData> = World.registerComponent<ModifierData>(
  'Modifier',
  () => ({ modifiers: [] })
)

export type GlobalModifierEntry = ModifierEntry & {
  filter?: (entity: Entity) => boolean
}

export class Modifier {
  private static readonly globalModifiers: GlobalModifierEntry[] = []

  static addLocal(entity: Entity, entry: ModifierEntry): void {
    const data = World.get(entity, ModifierComponent)
    if (data) {
      data.modifiers.push(entry)
    }
  }

  static removeLocal(entity: Entity, source: string): void {
    const data = World.get(entity, ModifierComponent)
    if (data) {
      data.modifiers = data.modifiers.filter(m => m.source !== source)
    }
  }

  static addGlobal(entry: GlobalModifierEntry): void {
    this.globalModifiers.push(entry)
  }

  static removeGlobal(source: string): void {
    const idx = this.globalModifiers.findIndex(m => m.source === source)
    if (idx !== -1) {
      this.globalModifiers.splice(idx, 1)
    }
  }

  static compute(entity: Entity, statId: StatId, baseValue: number): number {
    let additive = 0
    let multiplicative = 1

    const localData = World.get(entity, ModifierComponent)
    if (localData) {
      for (const mod of localData.modifiers) {
        if (mod.statId !== statId) continue
        if (mod.operation === 'add') {
          additive += mod.value
        } else {
          multiplicative *= mod.value
        }
      }
    }

    for (const mod of this.globalModifiers) {
      if (mod.statId !== statId) continue
      if (mod.filter && !mod.filter(entity)) continue
      if (mod.operation === 'add') {
        additive += mod.value
      } else {
        multiplicative *= mod.value
      }
    }

    return (baseValue + additive) * multiplicative
  }

  static clear(): void {
    this.globalModifiers.length = 0
  }
}
