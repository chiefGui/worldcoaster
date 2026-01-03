import { World } from '@ecs/world'
import type { Entity } from '@ecs/entity'
import type { ComponentSchema } from '@ecs/component'
import { Stat } from '@framework/stat/stat.component'

export const ParkStat = {
  money: 'money',
  attractiveness: 'attractiveness',
  entryFee: 'entryFee',
} as const

export type ParkStatId = (typeof ParkStat)[keyof typeof ParkStat]

export type ParkData = {
  name: string
}

export const ParkComponent: ComponentSchema<ParkData> = World.registerComponent<ParkData>(
  'Park',
  () => ({ name: 'My Park' })
)

let parkEntity: Entity | null = null

export class Park {
  static entity(): Entity {
    if (parkEntity === null) {
      throw new Error('Park not initialized. Call ParkAction.init() first.')
    }
    return parkEntity
  }

  static setEntity(entity: Entity): void {
    parkEntity = entity
  }

  static clearEntity(): void {
    parkEntity = null
  }

  static get(entity: Entity): ParkData | undefined {
    return World.get(entity, ParkComponent)
  }

  static money(): number {
    return Stat.get(Park.entity(), ParkStat.money)
  }

  static attractiveness(): number {
    return Stat.get(Park.entity(), ParkStat.attractiveness)
  }

  static entryFee(): number {
    return Stat.get(Park.entity(), ParkStat.entryFee)
  }

  static canAfford(amount: number): boolean {
    return Park.money() >= amount
  }
}
