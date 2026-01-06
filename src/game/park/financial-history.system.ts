import { System } from '@ecs/decorator'
import { GameTime } from '@framework/time'
import { FinancialHistory } from './financial-history.component'

@System('financial-history')
export class FinancialHistorySystem {
  private static lastDay = -1

  static tick(_dt: number): void {
    const currentDay = GameTime.getTotalDays()

    // Check if day changed
    if (currentDay > this.lastDay && this.lastDay >= 0) {
      FinancialHistory.endDay(this.lastDay)
    }

    this.lastDay = currentDay
  }

  static reset(): void {
    this.lastDay = -1
  }
}
