import { System } from '@ecs/decorator'
import { Park, ParkAction } from '@game/park'
import { GuestAction } from '@game/guest/guest.action'
import { CONFIG } from '@framework/config'

@System('attraction')
export class AttractionSystem {
  private static spawnAccumulator = 0

  static reset(): void {
    this.spawnAccumulator = 0
  }

  static tick(dt: number): void {
    const attractiveness = Park.attractivenessFinal()
    const novelty = Park.novelty()
    const spawnRate = attractiveness + novelty

    if (spawnRate <= 0) return

    const guestsPerSecond = spawnRate * CONFIG.spawn.factor
    this.spawnAccumulator += guestsPerSecond * dt

    while (this.spawnAccumulator >= 1) {
      const guest = GuestAction.spawn({ source: 'attraction-system' })
      if (guest) {
        ParkAction.addMoney({ amount: Park.entryFee(), source: 'entry-fee' })
      }
      this.spawnAccumulator -= 1
    }
  }
}
