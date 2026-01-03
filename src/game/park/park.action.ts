import { World } from '@ecs/world'
import { StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { Park, ParkComponent, ParkStat } from './park.component'

export type ParkInitParams = {
  name?: string
  initialMoney?: number
  initialAttractiveness?: number
  initialEntryFee?: number
}

const DEFAULTS = {
  name: 'My Park',
  initialMoney: 20000,
  initialAttractiveness: 10,
  initialEntryFee: 10,
}

export class ParkAction {
  static init(params: ParkInitParams = {}): void {
    const {
      name = DEFAULTS.name,
      initialMoney = DEFAULTS.initialMoney,
      initialAttractiveness = DEFAULTS.initialAttractiveness,
      initialEntryFee = DEFAULTS.initialEntryFee,
    } = params

    const entity = World.spawn()
    World.add(entity, ParkComponent, { name })
    World.add(entity, StatComponent, { values: {} })

    Park.setEntity(entity)

    StatAction.set({ entity, statId: ParkStat.money, value: initialMoney, source: 'park-init' })
    StatAction.set({ entity, statId: ParkStat.attractiveness, value: initialAttractiveness, source: 'park-init' })
    StatAction.set({ entity, statId: ParkStat.entryFee, value: initialEntryFee, source: 'park-init' })
  }

  static addMoney(params: { amount: number; source: string }): void {
    const { amount, source } = params
    StatAction.change({ entity: Park.entity(), statId: ParkStat.money, delta: amount, source })
  }

  static spendMoney(params: { amount: number; source: string }): boolean {
    const { amount, source } = params
    if (!Park.canAfford(amount)) return false
    StatAction.change({ entity: Park.entity(), statId: ParkStat.money, delta: -amount, source })
    return true
  }

  static setEntryFee(params: { amount: number; source: string }): void {
    const { amount, source } = params
    StatAction.set({ entity: Park.entity(), statId: ParkStat.entryFee, value: amount, source })
  }

  static addAttractiveness(params: { amount: number; source: string }): void {
    const { amount, source } = params
    StatAction.change({ entity: Park.entity(), statId: ParkStat.attractiveness, delta: amount, source })
  }

  static reset(): void {
    Park.clearEntity()
  }
}
