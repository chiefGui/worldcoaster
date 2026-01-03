import { useMemo } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { GuestComponent } from '@game/guest/guest.component'
import { HamburgerMenu } from '@ui/feature/hamburger-menu'

export function Header() {
  const schemas = useMemo(() => [GuestComponent] as const, [])
  const guests = useQuery(schemas)

  return (
    <header className="flex items-center gap-3 px-2 py-2 bg-bg-secondary border-b border-border">
      <HamburgerMenu.Trigger />
      <h1 className="flex-1 text-lg font-bold text-text-primary">WorldCoaster</h1>
      <div className="flex items-center gap-2 text-text-secondary pr-2">
        <span className="text-sm">Guests:</span>
        <span className="font-medium text-text-primary">{guests.length}</span>
      </div>
    </header>
  )
}
