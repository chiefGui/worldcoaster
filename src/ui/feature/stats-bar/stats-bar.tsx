import { useMemo } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { useComponent } from '@ecs/react/use-component'
import { GuestComponent } from '@game/guest/guest.component'
import { Park, ParkStat } from '@game/park'
import { StatComponent } from '@framework/stat/stat.component'
import { Format } from '@ui/lib/format'

export function StatsBar() {
  const schemas = useMemo(() => [GuestComponent] as const, [])
  const guests = useQuery(schemas)

  const stats = useComponent(Park.entity(), StatComponent)
  const money = stats?.values[ParkStat.money] ?? 0

  return (
    <div className="flex items-center justify-center gap-6 px-4 py-2 bg-bg-primary border-b border-border-subtle">
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-sm">Money:</span>
        <span className="font-medium text-text-primary">{Format.moneyCompact(money)}</span>
      </div>
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-sm">Guests:</span>
        <span className="font-medium text-text-primary">{guests.length}</span>
      </div>
    </div>
  )
}
