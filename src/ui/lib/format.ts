export class Format {
  static money(value: number): string {
    return `$${value.toLocaleString()}`
  }

  static moneyCompact(value: number): string {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (absValue >= 1_000_000) {
      const millions = absValue / 1_000_000
      return `${sign}$${millions.toFixed(millions >= 10 ? 0 : 1)}M`
    }

    if (absValue >= 1_000) {
      const thousands = absValue / 1_000
      return `${sign}$${thousands.toFixed(thousands >= 10 ? 0 : 1)}k`
    }

    return `${sign}$${absValue.toLocaleString()}`
  }

  static moneyDelta(value: number): string {
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${Format.money(value)}`
  }
}
