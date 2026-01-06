import { World } from '@ecs/world'
import type { ComponentSchema } from '@ecs/component'

export type FinancialHistoryData = {
  dailyIncome: number[] // Income per day (last 30 days)
  dailyExpenses: number[] // Expenses per day (last 30 days)
  lastRecordedDay: number // Last totalDays when we recorded
  currentDayIncome: number // Accumulator for current day
  currentDayExpenses: number // Accumulator for current day
}

export const FinancialHistoryComponent: ComponentSchema<FinancialHistoryData> =
  World.registerComponent<FinancialHistoryData>('FinancialHistory', () => ({
    dailyIncome: [],
    dailyExpenses: [],
    lastRecordedDay: -1,
    currentDayIncome: 0,
    currentDayExpenses: 0,
  }))

const MAX_HISTORY_DAYS = 30

export class FinancialHistory {
  static recordTransaction(amount: number): void {
    const park = getParkEntity()
    if (!park) return

    const history = World.get(park, FinancialHistoryComponent)
    if (!history) return

    if (amount > 0) {
      history.currentDayIncome += amount
    } else {
      history.currentDayExpenses += Math.abs(amount)
    }
  }

  static endDay(totalDays: number): void {
    const park = getParkEntity()
    if (!park) return

    const history = World.get(park, FinancialHistoryComponent)
    if (!history) return

    // Don't double-record the same day
    if (history.lastRecordedDay >= totalDays) return

    // Record current day's totals
    history.dailyIncome.push(history.currentDayIncome)
    history.dailyExpenses.push(history.currentDayExpenses)

    // Keep only last N days
    if (history.dailyIncome.length > MAX_HISTORY_DAYS) {
      history.dailyIncome.shift()
    }
    if (history.dailyExpenses.length > MAX_HISTORY_DAYS) {
      history.dailyExpenses.shift()
    }

    // Reset accumulators
    history.currentDayIncome = 0
    history.currentDayExpenses = 0
    history.lastRecordedDay = totalDays

    World.notifyChange(park, FinancialHistoryComponent)
  }

  static getIncomeHistory(): number[] {
    const park = getParkEntity()
    if (!park) return []

    const history = World.get(park, FinancialHistoryComponent)
    if (!history) return []

    // Include current day's income in the history
    return [...history.dailyIncome, history.currentDayIncome]
  }

  static getExpenseHistory(): number[] {
    const park = getParkEntity()
    if (!park) return []

    const history = World.get(park, FinancialHistoryComponent)
    if (!history) return []

    return [...history.dailyExpenses, history.currentDayExpenses]
  }
}

// Lazy import to avoid circular dependency
let getParkEntity: () => number | null = () => null

export function setFinancialHistoryParkGetter(getter: () => number | null): void {
  getParkEntity = getter
}
