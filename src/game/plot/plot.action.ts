import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { PlotComponent, Plot } from './plot.component'

export class PlotAction {
  static create(): Entity {
    const entity = World.spawn()
    World.add(entity, PlotComponent, { buildingEntity: null })
    return entity
  }

  static isEmpty(plotEntity: Entity): boolean {
    return Plot.isEmpty(plotEntity)
  }
}
