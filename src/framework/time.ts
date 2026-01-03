export class GameTime {
  private static readonly REAL_SECONDS_PER_DAY = 15
  private static elapsed = 0
  private static day = 1
  private static paused = false

  static tick(dt: number): void {
    if (this.paused) return
    this.elapsed += dt
    while (this.elapsed >= this.REAL_SECONDS_PER_DAY) {
      this.elapsed -= this.REAL_SECONDS_PER_DAY
      this.day++
    }
  }

  static getDay(): number {
    return this.day
  }

  static getDayProgress(): number {
    return this.elapsed / this.REAL_SECONDS_PER_DAY
  }

  static getHour(): number {
    return Math.floor(this.getDayProgress() * 24)
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
    this.day = 1
    this.paused = false
  }

  static getState(): { elapsed: number; day: number; paused: boolean } {
    return { elapsed: this.elapsed, day: this.day, paused: this.paused }
  }

  static setState(state: { elapsed: number; day: number; paused: boolean }): void {
    this.elapsed = state.elapsed
    this.day = state.day
    this.paused = state.paused
  }
}
