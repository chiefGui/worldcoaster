import { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react'
import type { Entity } from '@ecs/entity'
import { BuildingRegistry, type BuildingId } from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { BuildingPicker } from '@ui/feature/building-picker/building-picker'
import { Drawer } from '@ui/component/drawer'
import { Toast } from '@ui/component/toast'
import { ActionBar } from '@ui/component/action-bar'

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
  const drawerStore = Drawer.useStore()
  const actionBar = ActionBar.useActionBar()

  const isPlacementMode = selectedBuilding !== null

  // Legacy flow: click plot → open picker → select → place
  const openForPlot = useCallback(
    (plotEntity: Entity) => {
      setSelectedPlot(plotEntity)
      drawerStore.show()
    },
    [drawerStore]
  )

  // New flow: open picker → select building → enter placement mode
  const openPicker = useCallback(() => {
    setSelectedPlot(null)
    drawerStore.show()
  }, [drawerStore])

  // Cancel placement mode
  const cancelPlacement = useCallback(() => {
    setSelectedBuilding(null)
  }, [])

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
      drawerStore.hide()
    },
    [selectedPlot, drawerStore]
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

  // Show/hide ActionBar based on placement mode
  useEffect(() => {
    if (selectedBuilding) {
      const buildingDef = BuildingRegistry.get(selectedBuilding)
      if (buildingDef) {
        actionBar.show({
          icon: buildingDef.icon ? (
            <img src={buildingDef.icon} alt="" className="w-10 h-10" />
          ) : undefined,
          title: buildingDef.name,
          subtitle: 'Tap an empty plot to place',
          onDismiss: cancelPlacement,
        })
      }
    } else {
      actionBar.hide()
    }
  }, [selectedBuilding, actionBar, cancelPlacement])

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

      {/* Building Picker Drawer */}
      <Drawer.Root store={drawerStore}>
        <Drawer.Content side="right" className="flex flex-col">
          <BuildingPicker
            plotEntity={selectedPlot}
            onSelect={handleBuildingSelect}
          />
        </Drawer.Content>
      </Drawer.Root>
    </BuildingPlacementContext.Provider>
  )
}

export const BuildingPlacement = {
  Provider,
  usePlacement: useBuildingPlacement,
}
