import { World } from '@ecs/world'
import { Park } from '@game/park/park.component'
import { ParkAction } from '@game/park/park.action'
import { Perk, PerkRegistry, PerkStateComponent, type PerkId } from './perk.component'

export class PerkAction {
  static init(): void {
    const parkEntity = Park.entity()
    if (!World.get(parkEntity, PerkStateComponent)) {
      World.add(parkEntity, PerkStateComponent, { purchased: [] })
    }
  }

  static purchase(perkId: PerkId): boolean {
    if (!Perk.canPurchase(perkId)) return false

    const def = PerkRegistry.get(perkId)
    if (!def) return false

    const success = ParkAction.spendMoney({ amount: def.cost, source: `perk-purchase:${perkId}` })
    if (!success) return false

    const state = World.get(Park.entity(), PerkStateComponent)
    if (state && !state.purchased.includes(perkId)) {
      state.purchased.push(perkId)
      World.notifyChange(Park.entity(), PerkStateComponent)
    }

    // Run perk's onPurchase hook if defined
    def.onPurchase?.()

    return true
  }

  static reset(): void {
    const parkEntity = Park.entity()
    const state = World.get(parkEntity, PerkStateComponent)
    if (state) {
      state.purchased.length = 0
      World.notifyChange(parkEntity, PerkStateComponent)
    }
  }
}
