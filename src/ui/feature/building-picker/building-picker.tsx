import type { Entity } from '@ecs/entity'
import { BuildingRegistry, type BuildingId } from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { buttonVariants } from '@ui/component/button'
import { Drawer } from '@ui/component/drawer'

export type BuildingPickerProps = {
  plotEntity: Entity | null
  onSelect: (buildingId: BuildingId) => void
}

export function BuildingPicker({ plotEntity, onSelect }: BuildingPickerProps) {
  const buildings = BuildingRegistry.all()

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <Drawer.Heading>Build</Drawer.Heading>
        <Drawer.Close className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Close
        </Drawer.Close>
      </div>
      {!plotEntity && (
        <p className="text-text-secondary text-sm mb-4">
          Select a building, then tap a plot to place it.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3">
        {buildings.map((building) => {
          const cost = BuildingAction.getBuildCost(building)
          return (
            <button
              key={building.id}
              type="button"
              onClick={() => onSelect(building.id)}
              className="p-4 rounded-lg bg-bg-tertiary border border-border-subtle hover:border-accent transition-colors text-left flex items-center gap-3"
            >
              {building.icon && (
                <img src={building.icon} alt="" className="w-10 h-10 flex-shrink-0" />
              )}
              <div>
                <div className="font-medium text-text-primary">{building.name}</div>
                <div className="text-xs text-text-muted mt-1">
                  ${cost} · {building.capacity} capacity
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
