import { Header } from '@ui/feature/header/header'
import { StatsBar } from '@ui/feature/stats-bar/stats-bar'
import { ParkGrid } from '@ui/feature/park-grid/park-grid'
import { BuildingPlacement } from '@ui/feature/building-placement/building-placement'
import { BuildingInspector } from '@ui/feature/building-inspector'
import { HamburgerMenu } from '@ui/feature/hamburger-menu'
import { Footer } from '@ui/feature/footer/footer'

export function GameLayout() {
  return (
    <BuildingPlacement.Provider>
      <BuildingInspector.Provider>
        <HamburgerMenu.Root>
        <div className="min-h-screen bg-bg-primary flex flex-col pb-16">
          <Header />
          <StatsBar />
          <main className="flex-1">
            <ParkGrid />
          </main>
          <Footer />
        </div>
        <HamburgerMenu.Content />
        </HamburgerMenu.Root>
      </BuildingInspector.Provider>
    </BuildingPlacement.Provider>
  )
}
