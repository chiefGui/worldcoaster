import { Header } from '@ui/feature/header/header'
import { ParkGrid } from '@ui/feature/park-grid/park-grid'
import { BuildingPlacement } from '@ui/feature/building-placement/building-placement'
import { HamburgerMenu } from '@ui/feature/hamburger-menu'

export function GameLayout() {
  return (
    <BuildingPlacement.Provider>
      <HamburgerMenu.Root>
        <div className="min-h-screen bg-bg-primary flex flex-col">
          <Header />
          <main className="flex-1">
            <ParkGrid />
          </main>
        </div>
        <HamburgerMenu.Content />
      </HamburgerMenu.Root>
    </BuildingPlacement.Provider>
  )
}
