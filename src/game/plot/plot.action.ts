import type { Entity } from '@ecs/entity'
import { World } from '@ecs/world'
import { PlotComponent } from './plot.component'

export class PlotAction {
  static create(x: number, y: number): Entity {
    const entity = World.spawn()
    World.add(entity, PlotComponent, { x, y, buildingEntity: null })
    return entity
  }

  static isEmpty(plotEntity: Entity): boolean {
    const plot = World.get(plotEntity, PlotComponent)
    return plot?.buildingEntity === null
  }
}
