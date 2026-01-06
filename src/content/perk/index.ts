import { PerkRegistry } from '@game/perk'
import { entryFeeControl } from './entry-fee-control'
import { marketingBasics } from './marketing-basics'
import { efficientOperations } from './efficient-operations'

const perks = [entryFeeControl, marketingBasics, efficientOperations]

export function registerPerks(): void {
  for (const def of perks) {
    PerkRegistry.register(def)
  }
}
