import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import type { Entity } from '@ecs/entity'
import { BuildingPicker } from '@ui/feature/building-picker/building-picker'
import { Sheet } from '@ui/component/sheet'

type BuildingPlacementContextValue = {
  openForPlot: (plotEntity: Entity) => void
}

const BuildingPlacementContext = createContext<BuildingPlacementContextValue | null>(null)

export function useBuildingPlacement() {
  const context = useContext(BuildingPlacementContext)
  if (!context) {
    throw new Error('useBuildingPlacement must be used within BuildingPlacement.Provider')
  }
  return context
}

export type BuildingPlacementProviderProps = {
  children: ReactNode
}

function Provider({ children }: BuildingPlacementProviderProps) {
  const [selectedPlot, setSelectedPlot] = useState<Entity | null>(null)
  const sheetStore = Sheet.useStore()

  const openForPlot = useCallback(
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
    <BuildingPlacementContext.Provider value={{ openForPlot }}>
      {children}
      <Sheet.Root store={sheetStore}>
        <Sheet.Content>
          <BuildingPicker plotEntity={selectedPlot} onClose={handleClose} />
        </Sheet.Content>
      </Sheet.Root>
    </BuildingPlacementContext.Provider>
  )
}

export const BuildingPlacement = {
  Provider,
  usePlacement: useBuildingPlacement,
}
