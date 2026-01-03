import { System } from '@ecs/decorator'
import { GameTime } from './time'

@System('time')
export class TimeSystem {
  static tick(dt: number): void {
    GameTime.tick(dt)
  }
}
