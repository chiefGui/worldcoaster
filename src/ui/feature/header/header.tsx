import { HamburgerMenu } from '@ui/feature/hamburger-menu'

export function Header() {
  return (
    <header className="flex items-center px-2 py-2 bg-bg-secondary border-b border-border">
      <HamburgerMenu.Trigger />
    </header>
  )
}
