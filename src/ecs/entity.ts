export type Entity = number

export class EntityManager {
  private static nextId: Entity = 1
  private static readonly freeList: Entity[] = []
  private static readonly alive = new Set<Entity>()

  static create(): Entity {
    const entity = this.freeList.pop() ?? this.nextId++
    this.alive.add(entity)
    return entity
  }

  static destroy(entity: Entity): void {
    if (!this.alive.has(entity)) return
    this.alive.delete(entity)
    this.freeList.push(entity)
  }

  static isAlive(entity: Entity): boolean {
    return this.alive.has(entity)
  }

  static count(): number {
    return this.alive.size
  }

  static all(): ReadonlySet<Entity> {
    return this.alive
  }

  static clear(): void {
    this.nextId = 1
    this.freeList.length = 0
    this.alive.clear()
  }

  static restore(entity: Entity): void {
    this.alive.add(entity)
    if (entity >= this.nextId) {
      this.nextId = entity + 1
    }
    // Remove from freeList if present
    const idx = this.freeList.indexOf(entity)
    if (idx !== -1) {
      this.freeList.splice(idx, 1)
    }
  }
}
