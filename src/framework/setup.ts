import { World } from '@ecs/world'
import { SystemRegistry } from '@ecs/decorator'
import { ComponentRegistry } from '@ecs/component'
import { TimeSystem } from './system'
import { ModifierSystem } from './modifier/modifier.system'
import { GuestSystem } from '@game/guest/guest.system'
import { QueueSystem } from '@game/queue/queue.system'
import { Park, ParkComponent, ParkAction } from '@game/park'
import { EffectProcessor } from './effect'
import { GameTime } from './time'
import { Modifier } from './modifier/modifier.component'
import { registerBuildings } from '@content/building'
import { Persistence } from '@ecs/persistence/persistence'

export class Game {
  private static initialized = false

  static init(): void {
    if (this.initialized) return
    this.initialized = true

    registerBuildings()
    ParkAction.init()
    SystemRegistry.registerAll(TimeSystem, ModifierSystem, GuestSystem, QueueSystem)
  }

  static async start(): Promise<void> {
    this.init()
    const loaded = await Persistence.load()
    if (loaded) {
      // World was cleared and restored - need to find park entity reference
      this.restoreParkReference()
    }
    World.start()
    Persistence.startAutoSave()
  }

  private static restoreParkReference(): void {
    const parks = ComponentRegistry.getAll(ParkComponent)
    for (const [entity] of parks) {
      Park.setEntity(entity)
      return
    }
    // No park in saved data, create fresh one
    ParkAction.init()
  }

  static stop(): void {
    Persistence.stopAutoSave()
    Persistence.save().catch(console.error)
    World.stop()
  }

  static reset(): void {
    World.clear()
    EffectProcessor.clear()
    GameTime.reset()
    Modifier.clear()
    ParkAction.reset()
    this.initialized = false
  }

  static isRunning(): boolean {
    return World.isRunning()
  }
}
