import { useMemo, useCallback } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { useComponent } from '@ecs/react/use-component'
import { useTick } from '@ecs/react/use-world'
import { EffectProcessor } from '@framework/effect'
import { StatComponent } from '@framework/stat/stat.component'
import { GuestComponent } from '@game/guest/guest.component'
import { Park, ParkStat } from '@game/park'
import { CONFIG } from '@framework/config'

const RATE_WINDOW_MS = 10_000 // 10 seconds = 10 game days

type MoneySource = {
  source: string
  label: string
  amount: number
}

type MoneyBreakdown = {
  income: MoneySource[]
  expenses: MoneySource[]
  netRate: number
}

type GuestMetrics = {
  current: number
  spawnRate: number
  netRate: number
}

function formatSourceLabel(source: string): string {
  if (source === 'entry-fee') return 'Entry Fees'
  if (source === 'land-expansion') return 'Land Expansion'
  if (source === 'player') return 'Manual Actions'
  if (source.startsWith('building:')) return 'Building Effects'
  return source.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function useMoneyStats() {
  const stats = useComponent(Park.entity(), StatComponent)
  const money = stats?.values[ParkStat.money] ?? 0

  // Calculate rate from effect history
  const breakdown = useTick(
    useCallback((): MoneyBreakdown => {
      const since = Date.now() - RATE_WINDOW_MS
      const effects = EffectProcessor.queryStat(ParkStat.money, { since })

      // Group by source
      const sourceMap = new Map<string, number>()
      for (const effect of effects) {
        const current = sourceMap.get(effect.source) ?? 0
        sourceMap.set(effect.source, current + effect.payload.delta)
      }

      const income: MoneySource[] = []
      const expenses: MoneySource[] = []
      let netRate = 0

      for (const [source, amount] of sourceMap) {
        const entry = { source, label: formatSourceLabel(source), amount }
        if (amount > 0) {
          income.push(entry)
        } else if (amount < 0) {
          expenses.push(entry)
        }
        netRate += amount
      }

      // Sort by absolute amount
      income.sort((a, b) => b.amount - a.amount)
      expenses.sort((a, b) => a.amount - b.amount)

      // Convert to per-day rate (window is in seconds, 1 day = 1 second)
      const windowDays = RATE_WINDOW_MS / 1000
      return {
        income: income.map(i => ({ ...i, amount: i.amount / windowDays })),
        expenses: expenses.map(e => ({ ...e, amount: e.amount / windowDays })),
        netRate: netRate / windowDays,
      }
    }, [])
  )

  return { money, breakdown }
}

export function useGuestStats() {
  const schemas = useMemo(() => [GuestComponent] as const, [])
  const guests = useQuery(schemas)
  const stats = useComponent(Park.entity(), StatComponent)

  const metrics = useTick(
    useCallback((): GuestMetrics => {
      const attractiveness = stats?.values[ParkStat.attractiveness] ?? 0
      const novelty = stats?.values[ParkStat.novelty] ?? 0

      // Spawn rate calculation (same as AttractionSystem)
      const spawnRate = (attractiveness + novelty) * CONFIG.spawn.factor

      // Count spawn/despawn effects in window
      const since = Date.now() - RATE_WINDOW_MS
      const spawnEffects = EffectProcessor.query({ type: 'entity:spawn', since })
      const despawnEffects = EffectProcessor.query({ type: 'entity:despawn', since })

      const windowDays = RATE_WINDOW_MS / 1000
      const spawned = spawnEffects.length / windowDays
      const despawned = despawnEffects.length / windowDays

      return {
        current: guests.length,
        spawnRate: spawned || spawnRate, // Use actual if available, else calculated
        netRate: spawned - despawned,
      }
    }, [guests.length, stats])
  )

  return metrics
}
