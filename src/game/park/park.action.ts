import { World } from '@ecs/world'
import { Stat, StatComponent } from '@framework/stat/stat.component'
import { StatAction } from '@framework/stat/stat.action'
import { CONFIG } from '@framework/config'
import { Park, ParkComponent, ParkStat } from './park.component'

export type ParkInitParams = {
  name?: string
  initialMoney?: number
  initialAttractiveness?: number
  initialEntryFee?: number
  initialNovelty?: number
  initialUnlockedLandRows?: number
}

export class ParkAction {
  static init(params: ParkInitParams = {}): void {
    const {
      name = CONFIG.park.name,
      initialMoney = CONFIG.park.initial.money,
      initialAttractiveness = CONFIG.park.initial.attractiveness,
      initialEntryFee = CONFIG.park.initial.entryFee,
      initialNovelty = CONFIG.park.initial.novelty,
      initialUnlockedLandRows = CONFIG.park.initial.unlockedLandRows,
    } = params

    const entity = World.spawn()
    World.add(entity, ParkComponent, { name })
    World.add(entity, StatComponent, { values: {} })

    Park.setEntity(entity)

    // Use Stat.set directly for initialization - no effect tracking needed
    Stat.set(entity, ParkStat.money, initialMoney)
    Stat.set(entity, ParkStat.attractiveness, initialAttractiveness)
    Stat.set(entity, ParkStat.entryFee, initialEntryFee)
    Stat.set(entity, ParkStat.novelty, initialNovelty)
    Stat.set(entity, ParkStat.unlockedLandRows, initialUnlockedLandRows)
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

  static addNovelty(params: { amount: number; source: string }): void {
    const { amount, source } = params
    StatAction.change({ entity: Park.entity(), statId: ParkStat.novelty, delta: amount, source })
  }

  static setNovelty(params: { value: number; source: string }): void {
    const { value, source } = params
    StatAction.set({ entity: Park.entity(), statId: ParkStat.novelty, value, source })
  }

  static reset(): void {
    Park.clearEntity()
  }
}
