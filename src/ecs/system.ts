export type SystemFn = (dt: number) => void

export type SystemSchema = {
  readonly name: string
  readonly fn: SystemFn
  readonly after: readonly string[]
}

export class SystemManager {
  private static readonly systems = new Map<string, SystemSchema>()
  private static sorted: SystemSchema[] = []
  private static dirty = false

  static register(name: string, fn: SystemFn, after: readonly string[] = []): SystemSchema {
    if (this.systems.has(name)) return this.systems.get(name)!
    const schema: SystemSchema = { name, fn, after }
    this.systems.set(name, schema)
    this.dirty = true
    return schema
  }

  static unregister(name: string): void {
    if (this.systems.delete(name)) {
      this.dirty = true
    }
  }

  static run(dt: number): void {
    if (this.dirty) {
      this.sorted = this.topologicalSort()
      this.dirty = false
    }
    for (let i = 0; i < this.sorted.length; i++) {
      this.sorted[i]!.fn(dt)
    }
  }

  private static topologicalSort(): SystemSchema[] {
    const result: SystemSchema[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`)
      }
      const system = this.systems.get(name)
      if (!system) return
      visiting.add(name)
      for (const dep of system.after) {
        visit(dep)
      }
      visiting.delete(name)
      visited.add(name)
      result.push(system)
    }

    for (const name of this.systems.keys()) {
      visit(name)
    }

    return result
  }

  static clear(): void {
    this.systems.clear()
    this.sorted = []
    this.dirty = false
  }
}
