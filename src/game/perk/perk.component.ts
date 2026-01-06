import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { GuestComponent } from '@game/guest/guest.component'
import { GameTime } from '@framework/time'
import { Park } from '@game/park/park.component'

export type PerkId = string

export type PerkCategory = 'management' | 'economy' | 'guest' | 'park'

export type PerkRequirements = {
  minMoney?: number
  minDay?: number
  minGuests?: number
  minAttractiveness?: number
  requiredPerks?: PerkId[]
}

export type PerkDefinition = {
  id: PerkId
  name: string
  description: string
  icon?: string
  category: PerkCategory
  cost: number
  requirements?: PerkRequirements
  onPurchase?: () => void
}

export function definePerk<T extends PerkDefinition>(def: T): T {
  return def
}

export class PerkRegistry {
  private static readonly definitions = new Map<PerkId, PerkDefinition>()

  static register(def: PerkDefinition): void {
    this.definitions.set(def.id, def)
  }

  static get(id: PerkId): PerkDefinition | undefined {
    return this.definitions.get(id)
  }

  static all(): readonly PerkDefinition[] {
    return Array.from(this.definitions.values())
  }

  static byCategory(category: PerkCategory): readonly PerkDefinition[] {
    return this.all().filter((def) => def.category === category)
  }
}

// Store purchased perks on the Park entity
// Using array instead of Set for JSON serialization compatibility
export type PerkStateData = {
  purchased: PerkId[]
}

export const PerkStateComponent: ComponentSchema<PerkStateData> = World.registerComponent<PerkStateData>(
  'PerkState',
  () => ({ purchased: [] })
)

const guestQuery = World.createQuery([GuestComponent])

export class Perk {
  static getState(entity: Entity): PerkStateData | undefined {
    return World.get(entity, PerkStateComponent)
  }

  static isPurchased(perkId: PerkId): boolean {
    const state = World.get(Park.entity(), PerkStateComponent)
    return state?.purchased.includes(perkId) ?? false
  }

  static getPurchasedPerks(): PerkId[] {
    const state = World.get(Park.entity(), PerkStateComponent)
    return state?.purchased ?? []
  }

  static getGuestCount(): number {
    return World.query(guestQuery).size
  }

  static meetsRequirements(def: PerkDefinition): boolean {
    const { requirements } = def
    if (!requirements) return true

    if (requirements.minMoney !== undefined && Park.money() < requirements.minMoney) {
      return false
    }

    if (requirements.minDay !== undefined && GameTime.getTotalDays() < requirements.minDay) {
      return false
    }

    if (requirements.minGuests !== undefined && this.getGuestCount() < requirements.minGuests) {
      return false
    }

    if (requirements.minAttractiveness !== undefined && Park.attractiveness() < requirements.minAttractiveness) {
      return false
    }

    if (requirements.requiredPerks) {
      for (const requiredPerkId of requirements.requiredPerks) {
        if (!this.isPurchased(requiredPerkId)) {
          return false
        }
      }
    }

    return true
  }

  static canPurchase(perkId: PerkId): boolean {
    if (this.isPurchased(perkId)) return false

    const def = PerkRegistry.get(perkId)
    if (!def) return false

    if (!Park.canAfford(def.cost)) return false

    return this.meetsRequirements(def)
  }
}
