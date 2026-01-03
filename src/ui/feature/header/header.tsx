import { useMemo, useCallback } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { useTick } from '@ecs/react/use-world'
import { GuestComponent } from '@game/guest/guest.component'
import { Park } from '@game/park'

export function Header() {
  const schemas = useMemo(() => [GuestComponent] as const, [])
  const guests = useQuery(schemas)

  const getMoney = useCallback(() => {
    try {
      return Park.money()
    } catch {
      return 0
    }
  }, [])

  const money = useTick(getMoney)

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border">
      <h1 className="text-lg font-bold text-text-primary">WorldCoaster</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-sm">Money:</span>
          <span className="font-medium text-text-primary">${money.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-sm">Guests:</span>
          <span className="font-medium text-text-primary">{guests.length}</span>
        </div>
      </div>
    </header>
  )
}
