import { World } from '@ecs/world'
import { SystemRegistry } from '@ecs/decorator'
import { ComponentRegistry } from '@ecs/component'
import { TimeSystem } from './system'
import { ModifierSystem } from './modifier/modifier.system'
import { NoveltySystem } from '@game/novelty/novelty.system'
import { AttractionSystem } from '@game/attraction/attraction.system'
import { GuestSystem } from '@game/guest/guest.system'
import { QueueSystem } from '@game/queue/queue.system'
import { FinancialHistorySystem } from '@game/park/financial-history.system'
import { Park, ParkComponent, ParkAction, ParkStat } from '@game/park'
import { FinancialHistory } from '@game/park/financial-history.component'
import { PerkAction } from '@game/perk'
import { EffectProcessor, type StatChangePayload } from './effect'
import { GameTime } from './time'
import { Modifier } from './modifier/modifier.component'
import { registerBuildings } from '@content/building'
import { registerPerks } from '@content/perk'
import { Persistence } from '@ecs/persistence/persistence'

export class Game {
  private static initialized = false

  static init(): void {
    if (this.initialized) return
    this.initialized = true

    registerBuildings()
    registerPerks()
    ParkAction.init()
    PerkAction.init()
    SystemRegistry.registerAll(
      TimeSystem,
      ModifierSystem,
      NoveltySystem,
      AttractionSystem,
      GuestSystem,
      QueueSystem,
      FinancialHistorySystem
    )

    // Hook into effect processor to track money transactions
    EffectProcessor.onAfter<StatChangePayload>('stat:change', (effect) => {
      if (effect.payload.statId === ParkStat.money) {
        FinancialHistory.recordTransaction(effect.payload.delta)
      }
    })
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
      PerkAction.init() // Ensure perk state component exists after restore
      return
    }
    // No park in saved data, create fresh one
    ParkAction.init()
    PerkAction.init()
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
    SystemRegistry.resetAll()
    ParkAction.reset()
    this.initialized = false
  }

  static isRunning(): boolean {
    return World.isRunning()
  }
}
