import { useState, useCallback } from 'react'
import type { Entity } from '@ecs/entity'
import { Header } from '@ui/feature/header/header'
import { ParkGrid } from '@ui/feature/park-grid/park-grid'
import { BuildingPicker } from '@ui/feature/building-picker/building-picker'
import { Sheet } from '@ui/component/sheet'

export function GameLayout() {
  const [selectedPlot, setSelectedPlot] = useState<Entity | null>(null)
  const sheetStore = Sheet.useStore()

  const handleAddBuilding = useCallback(
    (plotEntity: Entity) => {
      setSelectedPlot(plotEntity)
      sheetStore.show()
    },
    [sheetStore]
  )

  const handleClose = useCallback(() => {
    sheetStore.hide()
    setSelectedPlot(null)
  }, [sheetStore])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1">
        <ParkGrid onAddBuilding={handleAddBuilding} />
      </main>
      <Sheet.Root store={sheetStore}>
        <Sheet.Content>
          <BuildingPicker plotEntity={selectedPlot} onClose={handleClose} />
        </Sheet.Content>
      </Sheet.Root>
    </div>
  )
}
