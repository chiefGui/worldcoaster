import type { Entity } from '@ecs/entity'
import { BuildingRegistry, type BuildingId } from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { buttonVariants } from '@ui/component/button'
import { Sheet } from '@ui/component/sheet'
import { Toast } from '@ui/component/toast'

export type BuildingPickerProps = {
  plotEntity: Entity | null
  onClose: () => void
}

export function BuildingPicker({ plotEntity, onClose }: BuildingPickerProps) {
  const buildings = BuildingRegistry.all()

  const handleSelect = (buildingId: BuildingId) => {
    if (!plotEntity) return
    const building = BuildingAction.build({ plotEntity, buildingId })
    if (building) {
      const def = BuildingRegistry.get(buildingId)
      Toast.success(`${def?.name ?? 'Building'} built!`)
    }
    onClose()
  }

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <Sheet.Heading>Build</Sheet.Heading>
        <Sheet.Close className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Close
        </Sheet.Close>
      </div>
      {!plotEntity && (
        <p className="text-text-muted text-sm mb-4">
          Tap an empty plot on the map to place a building.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {buildings.map((building) => {
          const cost = BuildingAction.getBuildCost(building)
          return (
            <button
              key={building.id}
              type="button"
              onClick={() => handleSelect(building.id)}
              disabled={!plotEntity}
              className="p-4 rounded-lg bg-bg-tertiary border border-border-subtle hover:border-accent transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-subtle"
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
