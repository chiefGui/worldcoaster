export class Format {
  static money(value: number): string {
    return `$${Math.round(value).toLocaleString()}`
  }

  static moneyCompact(value: number): string {
    const rounded = Math.round(value)
    const absValue = Math.abs(rounded)
    const sign = rounded < 0 ? '-' : ''

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
