import { HamburgerMenu } from '@ui/feature/hamburger-menu'
import { DateDisplay } from '@ui/feature/date-display'

export function Header() {
  return (
    <header className="flex items-center justify-between px-2 py-2 bg-bg-secondary border-b border-border">
      <HamburgerMenu.Trigger />
      <DateDisplay />
    </header>
  )
}
