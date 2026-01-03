import type { QuerySchema } from '@ecs/query'
import { World } from '@ecs/world'
import { System } from '@ecs/decorator'
import { ModifierComponent, ModifierDurationComponent } from './modifier.component'

@System('modifier')
export class ModifierSystem {
  private static durationQuery: QuerySchema | null = null

  private static getDurationQuery(): QuerySchema {
    return this.durationQuery ??= World.createQuery([ModifierComponent, ModifierDurationComponent])
  }

  static tick(dt: number): void {
    const modifiers = World.query(this.getDurationQuery())

    for (const modEntity of modifiers) {
      const duration = World.get(modEntity, ModifierDurationComponent)
      if (!duration) continue

      duration.remaining -= dt

      if (duration.remaining <= 0) {
        World.despawn(modEntity)
      }
    }
  }
}
