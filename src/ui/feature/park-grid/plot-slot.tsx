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
  const { openForPlot } = BuildingPlacement.usePlacement()
  const plot = useComponent(entity, PlotComponent)

  const buildingEntity = plot?.buildingEntity ?? null
  const isEmpty = buildingEntity === null

  return (
    <button
      type="button"
      onClick={() => isEmpty && openForPlot(entity)}
      disabled={!isEmpty}
      className={cn(
        'aspect-square rounded-lg border transition-colors',
        'flex items-center justify-center',
        isEmpty
          ? 'border-dashed border-border hover:border-accent hover:bg-bg-tertiary cursor-pointer'
          : 'border-solid border-border-subtle bg-bg-tertiary cursor-default'
      )}
    >
      {isEmpty ? (
        <span className="text-2xl text-text-muted">+</span>
      ) : (
        <BuildingDisplay entity={buildingEntity} />
      )}
    </button>
  )
}
