export const Season = {
  spring: 'spring',
  summer: 'summer',
  fall: 'fall',
  winter: 'winter',
} as const

export type SeasonId = (typeof Season)[keyof typeof Season]

export const SEASONS: readonly SeasonId[] = [
  Season.spring,
  Season.summer,
  Season.fall,
  Season.winter,
]

export const SEASON_NAMES: Record<SeasonId, string> = {
  [Season.spring]: 'Spring',
  [Season.summer]: 'Summer',
  [Season.fall]: 'Fall',
  [Season.winter]: 'Winter',
}

export const DAYS_PER_SEASON = 30
export const SEASONS_PER_YEAR = 4
export const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS_PER_YEAR // 120 days

export type GameDate = {
  day: number // 1-30 within season
  season: SeasonId
  seasonIndex: number // 0-3
  year: number
  totalDays: number // total days since game start
}

export type GameTimeState = {
  elapsed: number
  totalDays: number
  paused: boolean
}

export class GameTime {
  private static readonly REAL_SECONDS_PER_DAY = 1
  private static readonly START_YEAR = 2026

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
    const year = this.START_YEAR + Math.floor(this.totalDays / DAYS_PER_YEAR)
    const dayOfYear = this.totalDays % DAYS_PER_YEAR
    const seasonIndex = Math.floor(dayOfYear / DAYS_PER_SEASON)
    const day = (dayOfYear % DAYS_PER_SEASON) + 1

    return {
      day,
      season: SEASONS[seasonIndex]!,
      seasonIndex,
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
    const { day, year } = this.getDate()
    return `${this.getSeasonName()} ${day}, ${year}`
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

  static setState(state: GameTimeState): void {
    this.elapsed = state.elapsed
    this.totalDays = state.totalDays
    this.paused = state.paused
  }
}
