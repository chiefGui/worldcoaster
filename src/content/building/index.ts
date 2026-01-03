import { BuildingRegistry } from '@game/building/building.component'
import { carousel } from './carousel'

const buildings = [carousel]

export function registerBuildings(): void {
  for (const def of buildings) {
    BuildingRegistry.register(def)
  }
}
