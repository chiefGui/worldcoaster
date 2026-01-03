export type StatEffect = {
  stat: string
  amount: number
}

export class StatEffectUtil {
  static sum(effects: readonly StatEffect[], stat: string): number {
    return effects.reduce((sum, e) => (e.stat === stat ? sum + e.amount : sum), 0)
  }

  static find(effects: readonly StatEffect[], stat: string): StatEffect | undefined {
    return effects.find((e) => e.stat === stat)
  }
}
