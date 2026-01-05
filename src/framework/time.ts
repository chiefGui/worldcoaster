export const Season = {
  spring: 'spring',
  summer: 'summer',
  fall: 'fall',
  winter: 'winter',
} as const

export type SeasonId = (typeof Season)[keyof typeof Season]

export const SEASON_NAMES: Record<SeasonId, string> = {
  [Season.spring]: 'Spring',
  [Season.summer]: 'Summer',
  [Season.fall]: 'Fall',
  [Season.winter]: 'Winter',
}

export const Month = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
} as const

export const MONTH_NAMES: Record<number, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
}

export const MONTH_NAMES_SHORT: Record<number, string> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
}

// Days in each month (non-leap year)
export const DAYS_IN_MONTH: Record<number, number> = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
}

export const DAYS_PER_YEAR = 365

// Season definitions by month
// Spring: Mar, Apr, May (3, 4, 5)
// Summer: Jun, Jul, Aug (6, 7, 8)
// Fall: Sep, Oct, Nov (9, 10, 11)
// Winter: Dec, Jan, Feb (12, 1, 2)
export function getSeasonForMonth(month: number): SeasonId {
  if (month >= 3 && month <= 5) return Season.spring
  if (month >= 6 && month <= 8) return Season.summer
  if (month >= 9 && month <= 11) return Season.fall
  return Season.winter // Dec, Jan, Feb
}

export const SEASON_MONTHS: Record<SeasonId, number[]> = {
  [Season.spring]: [3, 4, 5],
  [Season.summer]: [6, 7, 8],
  [Season.fall]: [9, 10, 11],
  [Season.winter]: [12, 1, 2],
}

export type GameDate = {
  day: number // 1-31
  month: number // 1-12
  monthName: string
  monthNameShort: string
  season: SeasonId
  year: number
  totalDays: number
}

export type GameTimeState = {
  elapsed: number
  totalDays: number
  paused: boolean
}

// Starting date: March 1, 2026 (first day of spring)
const START_YEAR = 2026
// Day of year for March 1 (Jan has 31 days, Feb has 28 = 59 days before March)
const START_DAY_OF_YEAR = 31 + 28

export class GameTime {
  private static readonly REAL_SECONDS_PER_DAY = 1

  private static elapsed = 0
  private static totalDays = 0
  private static paused = false

  static tick(dt: number): void {
    if (this.paused) return
    this.elapsed += dt
    while (this.elapsed >= this.REAL_SECONDS_PER_DAY) {
      this.elapsed -= this.REAL_SECONDS_PER_DAY
      this.totalDays++
    }
  }

  static getDate(): GameDate {
    // Convert totalDays to actual calendar date starting from March 1, 2026
    let remainingDays = this.totalDays
    let year = START_YEAR
    let dayOfYear = START_DAY_OF_YEAR // Start at March 1 (day 59 of year, 0-indexed would be 58)

    // Add remaining days to day of year
    dayOfYear += remainingDays

    // Handle year overflow
    while (dayOfYear >= DAYS_PER_YEAR) {
      dayOfYear -= DAYS_PER_YEAR
      year++
    }

    // Convert day of year to month and day
    let month = 1
    let day = dayOfYear

    for (let m = 1; m <= 12; m++) {
      const daysInMonth = DAYS_IN_MONTH[m]!
      if (day < daysInMonth) {
        month = m
        day = day + 1 // Convert to 1-indexed
        break
      }
      day -= daysInMonth
    }

    return {
      day,
      month,
      monthName: MONTH_NAMES[month]!,
      monthNameShort: MONTH_NAMES_SHORT[month]!,
      season: getSeasonForMonth(month),
      year,
      totalDays: this.totalDays,
    }
  }

  static getSeason(): SeasonId {
    return this.getDate().season
  }

  static getSeasonName(): string {
    return SEASON_NAMES[this.getSeason()]
  }

  static getDay(): number {
    return this.getDate().day
  }

  static getMonth(): number {
    return this.getDate().month
  }

  static getYear(): number {
    return this.getDate().year
  }

  static getTotalDays(): number {
    return this.totalDays
  }

  static getDayProgress(): number {
    return this.elapsed / this.REAL_SECONDS_PER_DAY
  }

  static getFormattedDate(): string {
    const { day, monthNameShort, year } = this.getDate()
    return `${monthNameShort} ${day}, ${year}`
  }

  static isPaused(): boolean {
    return this.paused
  }

  static pause(): void {
    this.paused = true
  }

  static resume(): void {
    this.paused = false
  }

  static toggle(): void {
    this.paused = !this.paused
  }

  static reset(): void {
    this.elapsed = 0
    this.totalDays = 0
    this.paused = false
  }

  static getState(): GameTimeState {
    return { elapsed: this.elapsed, totalDays: this.totalDays, paused: this.paused }
  }

  static setState(state: GameTimeState & { day?: number }): void {
    this.elapsed = state.elapsed ?? 0
    // Support old saves that used 'day' instead of 'totalDays'
    this.totalDays = state.totalDays ?? state.day ?? 0
    this.paused = state.paused ?? false
  }
}
