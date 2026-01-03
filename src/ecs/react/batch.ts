export type UpdateCallback = () => void

export class ReactBatch {
  private static pending = new Set<UpdateCallback>()
  private static scheduled = false
  private static frameId = 0

  static schedule(callback: UpdateCallback): void {
    this.pending.add(callback)
    if (!this.scheduled) {
      this.scheduled = true
      this.frameId = requestAnimationFrame(this.flush)
    }
  }

  static flush = (): void => {
    this.scheduled = false
    this.frameId = 0
    const callbacks = Array.from(this.pending)
    this.pending.clear()
    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i]!()
    }
  }

  static flushSync(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }
    this.flush()
  }

  static clear(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }
    this.pending.clear()
    this.scheduled = false
    this.frameId = 0
  }
}
