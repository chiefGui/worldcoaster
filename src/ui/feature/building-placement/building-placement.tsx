import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Entity } from '@ecs/entity'
import { BuildingRegistry, type BuildingId } from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { BuildingPicker } from '@ui/feature/building-picker/building-picker'
import { Sheet } from '@ui/component/sheet'
import { Toast } from '@ui/component/toast'
import { cn } from '@ui/lib/cn'

type BuildingPlacementContextValue = {
  // Legacy: open picker for a specific plot (clicking on plot)
  openForPlot: (plotEntity: Entity) => void
  // New: open picker to browse/select a building
  openPicker: () => void
  // Placement mode state
  isPlacementMode: boolean
  selectedBuilding: BuildingId | null
  // Place the selected building on a plot
  placeOnPlot: (plotEntity: Entity) => void
  // Cancel placement mode
  cancelPlacement: () => void
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
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId | null>(null)
  const sheetStore = Sheet.useStore()

  const isPlacementMode = selectedBuilding !== null

  // Legacy flow: click plot → open picker → select → place
  const openForPlot = useCallback(
    (plotEntity: Entity) => {
      setSelectedPlot(plotEntity)
      sheetStore.show()
    },
    [sheetStore]
  )

  // New flow: open picker → select building → enter placement mode
  const openPicker = useCallback(() => {
    setSelectedPlot(null)
    sheetStore.show()
  }, [sheetStore])

  // Called when user selects a building from the picker
  const handleBuildingSelect = useCallback(
    (buildingId: BuildingId) => {
      if (selectedPlot) {
        // Legacy flow: place directly on the pre-selected plot
        const building = BuildingAction.build({ plotEntity: selectedPlot, buildingId })
        if (building) {
          const def = BuildingRegistry.get(buildingId)
          Toast.success(`${def?.name ?? 'Building'} built!`)
        }
        setSelectedPlot(null)
      } else {
        // New flow: enter placement mode
        setSelectedBuilding(buildingId)
      }
      sheetStore.hide()
    },
    [selectedPlot, sheetStore]
  )

  // Place the selected building on a plot (placement mode)
  const placeOnPlot = useCallback(
    (plotEntity: Entity) => {
      if (!selectedBuilding) return
      const building = BuildingAction.build({ plotEntity, buildingId: selectedBuilding })
      if (building) {
        const def = BuildingRegistry.get(selectedBuilding)
        Toast.success(`${def?.name ?? 'Building'} built!`)
      }
      setSelectedBuilding(null)
    },
    [selectedBuilding]
  )

  // Cancel placement mode
  const cancelPlacement = useCallback(() => {
    setSelectedBuilding(null)
  }, [])

  const buildingDef = selectedBuilding ? BuildingRegistry.get(selectedBuilding) : null

  return (
    <BuildingPlacementContext.Provider
      value={{
        openForPlot,
        openPicker,
        isPlacementMode,
        selectedBuilding,
        placeOnPlot,
        cancelPlacement,
      }}
    >
      {children}

      {/* Building Picker Sheet */}
      <Sheet.Root store={sheetStore}>
        <Sheet.Content>
          <BuildingPicker
            plotEntity={selectedPlot}
            onSelect={handleBuildingSelect}
          />
        </Sheet.Content>
      </Sheet.Root>

      {/* Placement Mode Indicator */}
      {isPlacementMode && buildingDef && (
        <div
          className={cn(
            'fixed bottom-20 left-4 right-4 z-50',
            'bg-accent text-white rounded-xl shadow-lg',
            'flex items-center gap-3 p-3',
            'animate-in slide-in-from-bottom-4 fade-in duration-200'
          )}
        >
          {buildingDef.icon && (
            <img src={buildingDef.icon} alt="" className="w-10 h-10 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{buildingDef.name}</div>
            <div className="text-sm text-white/80">Tap an empty plot to place</div>
          </div>
          <button
            onClick={cancelPlacement}
            className={cn(
              'p-2 rounded-lg',
              'bg-white/20 hover:bg-white/30',
              'transition-colors'
            )}
            aria-label="Cancel placement"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </BuildingPlacementContext.Provider>
  )
}

export const BuildingPlacement = {
  Provider,
  usePlacement: useBuildingPlacement,
}
