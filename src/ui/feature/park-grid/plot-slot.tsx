import type { Entity } from '@ecs/entity'
import { useComponent } from '@ecs/react/use-component'
import { PlotComponent } from '@game/plot/plot.component'
import { BuildingComponent, BuildingRegistry } from '@game/building/building.component'
import { BuildingPlacement } from '@ui/feature/building-placement/building-placement'
import { cn } from '@ui/lib/cn'

type BuildingDisplayProps = {
  entity: Entity
}

function BuildingDisplay({ entity }: BuildingDisplayProps) {
  const building = useComponent(entity, BuildingComponent)
  const buildingDef = building ? BuildingRegistry.get(building.id) : null

  if (buildingDef?.icon) {
    return <img src={buildingDef.icon} alt={buildingDef.name} className="w-8 h-8" />
  }

  return (
    <span className="text-xs text-text-secondary text-center px-1">
      {buildingDef?.name ?? 'Building'}
    </span>
  )
}

export type PlotSlotProps = {
  entity: Entity
}

export function PlotSlot({ entity }: PlotSlotProps) {
  const { openForPlot, isPlacementMode, placeOnPlot } = BuildingPlacement.usePlacement()
  const plot = useComponent(entity, PlotComponent)

  const buildingEntity = plot?.buildingEntity ?? null
  const isEmpty = buildingEntity === null

  const handleClick = () => {
    if (!isEmpty) return

    if (isPlacementMode) {
      // Placement mode: place the selected building
      placeOnPlot(entity)
    } else {
      // Normal mode: open the picker for this plot
      openForPlot(entity)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isEmpty}
      className={cn(
        'aspect-square rounded-lg border transition-all',
        'flex items-center justify-center',
        isEmpty
          ? 'border-dashed border-border hover:border-accent hover:bg-bg-tertiary cursor-pointer'
          : 'border-solid border-border-subtle bg-bg-tertiary cursor-default',
        // Placement mode: highlight empty slots
        isEmpty && isPlacementMode && [
          'border-accent border-solid bg-accent/10',
          'animate-pulse',
        ]
      )}
    >
      {isEmpty ? (
        <span className={cn(
          'text-2xl',
          isPlacementMode ? 'text-accent' : 'text-text-muted'
        )}>+</span>
      ) : (
        <BuildingDisplay entity={buildingEntity} />
      )}
    </button>
  )
}
