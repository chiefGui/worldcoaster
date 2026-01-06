import { PerkRegistry } from '@game/perk'
import { entryFeeControl } from './entry-fee-control'

const perks = [entryFeeControl]

export function registerPerks(): void {
  for (const def of perks) {
    PerkRegistry.register(def)
  }
}
