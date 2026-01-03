import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'

export type PlotData = {
  x: number
  y: number
  buildingEntity: Entity | null
}

export const PlotComponent: ComponentSchema<PlotData> = World.registerComponent<PlotData>(
  'Plot',
  () => ({ x: 0, y: 0, buildingEntity: null })
)

export class Plot {
  static create(x: number, y: number): Entity {
    const entity = World.spawn()
    World.add(entity, PlotComponent, { x, y, buildingEntity: null })
    return entity
  }

  static getBuilding(plotEntity: Entity): Entity | null {
    const data = World.get(plotEntity, PlotComponent)
    return data?.buildingEntity ?? null
  }

  static setBuilding(plotEntity: Entity, buildingEntity: Entity | null): void {
    const data = World.get(plotEntity, PlotComponent)
    if (data) {
      data.buildingEntity = buildingEntity
    }
  }

  static isEmpty(plotEntity: Entity): boolean {
    return this.getBuilding(plotEntity) === null
  }

  static getPosition(plotEntity: Entity): { x: number; y: number } | null {
    const data = World.get(plotEntity, PlotComponent)
    return data ? { x: data.x, y: data.y } : null
  }
}
