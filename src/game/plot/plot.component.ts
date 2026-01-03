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
