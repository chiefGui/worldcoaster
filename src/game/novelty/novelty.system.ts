import { System } from '@ecs/decorator'
import { Park } from '@game/park'
import { ParkAction } from '@game/park'
import { CONFIG } from '@framework/config'

@System('novelty')
export class NoveltySystem {
  static tick(dt: number): void {
    const current = Park.novelty()
    if (current <= 0) return

    const decay = CONFIG.novelty.decayRate * dt
    const newValue = Math.max(0, current - decay)
    ParkAction.setNovelty({ value: newValue, source: 'novelty-decay' })
  }
}
