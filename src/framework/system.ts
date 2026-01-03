import { World } from '@ecs/world'
import { GameTime } from './time'

export class TimeSystem {
  private static readonly NAME = 'time'

  static register(): void {
    World.registerSystem(this.NAME, (dt: number) => {
      GameTime.tick(dt)
    })
  }
}
