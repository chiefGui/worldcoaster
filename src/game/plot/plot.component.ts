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
