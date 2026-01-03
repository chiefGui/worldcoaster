import { World } from '@ecs/world'
import { SystemRegistry } from '@ecs/decorator'
import { TimeSystem } from './system'
import { ModifierSystem } from './modifier/modifier.system'
import { GuestSystem } from '@game/guest/guest.system'
import { QueueSystem } from '@game/queue/queue.system'
import { ParkAction } from '@game/park'
import { EffectProcessor } from './effect'
import { GameTime } from './time'
import { Modifier } from './modifier/modifier.component'
import { registerBuildings } from '@content/building'

export class Game {
  private static initialized = false

  static init(): void {
    if (this.initialized) return
    this.initialized = true

    registerBuildings()
    ParkAction.init()
    SystemRegistry.registerAll(TimeSystem, ModifierSystem, GuestSystem, QueueSystem)
  }

  static start(): void {
    this.init()
    World.start()
  }

  static stop(): void {
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
