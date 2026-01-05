import { CONFIG } from '@framework/config'
import { StatAction } from '@framework/stat/stat.action'
import { Park, ParkStat } from '@game/park/park.component'
import { ParkAction } from '@game/park/park.action'
import { PlotAction } from '@game/plot/plot.action'

export class LandAction {
  /**
   * Get the price for a specific row number (1-indexed).
   * Row 1 is free (initial), row 2+ costs exponentially more.
   */
  static getRowPrice(rowNumber: number): number {
    if (rowNumber <= 1) return 0
    const { base, multiplier } = CONFIG.land.price
    return Math.floor(base * Math.pow(multiplier, rowNumber - 2))
  }

  /**
   * Get the price for the next row to unlock.
   */
  static getNextRowPrice(): number {
    const currentRows = Park.unlockedLandRows()
    return LandAction.getRowPrice(currentRows + 1)
  }

  /**
   * Check if the player can expand (has money and not at max).
   */
  static canExpand(): boolean {
    const currentRows = Park.unlockedLandRows()
    if (currentRows >= CONFIG.land.maxRows) return false
    return Park.canAfford(LandAction.getNextRowPrice())
  }

  /**
   * Check if the player is at the max rows limit.
   */
  static isAtMaxRows(): boolean {
    return Park.unlockedLandRows() >= CONFIG.land.maxRows
  }

  /**
   * Expand the park by one row. Returns true if successful.
   * Creates new plot entities for the new row.
   */
  static expand(): boolean {
    if (!LandAction.canExpand()) return false

    const price = LandAction.getNextRowPrice()
    const success = ParkAction.spendMoney({ amount: price, source: 'land-expansion' })

    if (!success) return false

    // Create new plots for the new row
    const slotsPerRow = CONFIG.land.slotsPerRow
    for (let i = 0; i < slotsPerRow; i++) {
      PlotAction.create()
    }

    // Update unlocked rows count
    const currentRows = Park.unlockedLandRows()
    StatAction.set({
      entity: Park.entity(),
      statId: ParkStat.unlockedLandRows,
      value: currentRows + 1,
      source: 'land-expansion',
    })

    return true
  }

  /**
   * Get the total number of plots currently available.
   */
  static getTotalPlots(): number {
    return Park.unlockedLandRows() * CONFIG.land.slotsPerRow
  }
}
