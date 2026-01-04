import { SystemManager } from './system'
import { ComponentRegistry, type ComponentData, type ComponentSchema } from './component'

type SystemClass = {
  tick: (dt: number) => void
  reset?: () => void
}

type SystemMetadata = {
  name: string
  after: string[]
}

const systemRegistry = new Map<SystemClass, SystemMetadata>()
const componentSchemas = new Map<Function, ComponentSchema>()

export function System(name: string): ClassDecorator {
  return (target) => {
    const existing = systemRegistry.get(target as unknown as SystemClass) ?? { name: '', after: [] }
    existing.name = name
    systemRegistry.set(target as unknown as SystemClass, existing)
  }
}

export function After(...dependencies: string[]): ClassDecorator {
  return (target) => {
    const existing = systemRegistry.get(target as unknown as SystemClass) ?? { name: '', after: [] }
    existing.after.push(...dependencies)
    systemRegistry.set(target as unknown as SystemClass, existing)
  }
}

export function Component<T extends ComponentData>(name: string, defaultFn?: () => T): ClassDecorator {
  return (target) => {
    const schema = ComponentRegistry.register<T>(name, defaultFn)
    componentSchemas.set(target, schema as ComponentSchema)
    Object.defineProperty(target, 'schema', { value: schema, writable: false })
  }
}

export class SystemRegistry {
  private static readonly registered: SystemClass[] = []

  static register(systemClass: SystemClass): void {
    const metadata = systemRegistry.get(systemClass)
    if (!metadata?.name) {
      throw new Error(`System ${systemClass.constructor.name} is not decorated with @System`)
    }
    SystemManager.register(metadata.name, systemClass.tick.bind(systemClass), metadata.after)
    this.registered.push(systemClass)
  }

  static registerAll(...systems: SystemClass[]): void {
    for (const system of systems) {
      this.register(system)
    }
  }

  static resetAll(): void {
    for (const system of this.registered) {
      system.reset?.()
    }
  }
}

export class ComponentSchemas {
  static get<T extends ComponentData>(componentClass: Function): ComponentSchema<T> | undefined {
    return componentSchemas.get(componentClass) as ComponentSchema<T> | undefined
  }
}
