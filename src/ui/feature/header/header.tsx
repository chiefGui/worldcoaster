import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { GuestComponent } from '@game/guest/guest.component'
import { Park } from '@game/park'
import { HamburgerMenu } from '@ui/feature/hamburger-menu'
import { Format } from '@ui/lib/format'

export function Header() {
  const schemas = useMemo(() => [GuestComponent] as const, [])
  const guests = useQuery(schemas)

  // Bypass useTick - poll directly to debug
  const [money, setMoney] = useState(() => {
    try {
      return Park.money()
    } catch {
      return 0
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setMoney(Park.money())
      } catch {
        setMoney(0)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center gap-3 px-2 py-2 bg-bg-secondary border-b border-border">
      <HamburgerMenu.Trigger />
      <h1 className="flex-1 text-lg font-bold text-text-primary">WorldCoaster</h1>
      <div className="flex items-center gap-4 pr-2">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-sm">Money:</span>
          <span className="font-medium text-text-primary">{Format.moneyCompact(money)}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-sm">Guests:</span>
          <span className="font-medium text-text-primary">{guests.length}</span>
        </div>
      </div>
    </header>
  )
}
