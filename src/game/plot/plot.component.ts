import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

export type PlotData = {
  buildingEntity: Entity | null
}

export const PlotComponent: ComponentSchema<PlotData> = World.registerComponent<PlotData>(
  'Plot',
  () => ({ buildingEntity: null })
)

export class Plot {
  static get(entity: Entity): PlotData | undefined {
    return World.get(entity, PlotComponent)
  }

  static getBuilding(entity: Entity): Entity | null {
    return Plot.get(entity)?.buildingEntity ?? null
  }

  static setBuilding(entity: Entity, buildingEntity: Entity | null): void {
    const data = World.get(entity, PlotComponent)
    if (data) {
      data.buildingEntity = buildingEntity
      World.notifyChange(entity, PlotComponent)
    }
  }

  static isEmpty(entity: Entity): boolean {
    return Plot.getBuilding(entity) === null
  }
}
