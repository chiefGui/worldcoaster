export type Listener<T = unknown> = (data: T) => void

export type Unsubscribe = () => void

export class EventBus {
  private static readonly listeners = new Map<string, Set<Listener>>()
  private static readonly queue: Array<{ event: string; data: unknown }> = []
  private static batching = false

  static on<T = unknown>(event: string, listener: Listener<T>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as Listener)
    return () => this.listeners.get(event)?.delete(listener as Listener)
  }

  static emit<T = unknown>(event: string, data: T): void {
    if (this.batching) {
      this.queue.push({ event, data })
      return
    }
    this.dispatch(event, data)
  }

  private static dispatch(event: string, data: unknown): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const listener of set) {
      listener(data)
    }
  }

  static startBatch(): void {
    this.batching = true
  }

  static endBatch(): void {
    this.batching = false
    for (let i = 0; i < this.queue.length; i++) {
      const { event, data } = this.queue[i]!
      this.dispatch(event, data)
    }
    this.queue.length = 0
  }

  static clear(): void {
    this.listeners.clear()
    this.queue.length = 0
    this.batching = false
  }
}
