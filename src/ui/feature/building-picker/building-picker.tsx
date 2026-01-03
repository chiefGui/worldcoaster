import type { Entity } from '@ecs/entity'
import { BuildingRegistry, type BuildingId } from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { StatEffectUtil } from '@framework/stat/stat-effect'
import { Button } from '@ui/component/button'
import { Sheet } from '@ui/component/sheet'

export type BuildingPickerProps = {
  plotEntity: Entity | null
  onClose: () => void
}

export function BuildingPicker({ plotEntity, onClose }: BuildingPickerProps) {
  const buildings = BuildingRegistry.all()

  const handleSelect = (buildingId: BuildingId) => {
    if (!plotEntity) return
    BuildingAction.build({ plotEntity, buildingId })
    onClose()
  }

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Build</h2>
        <Sheet.Close>
          <Button variant="ghost" size="sm">
            Close
          </Button>
        </Sheet.Close>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {buildings.map((building) => {
          const cost = StatEffectUtil.find(building.input, 'money')?.amount ?? 0
          return (
            <button
              key={building.id}
              type="button"
              onClick={() => handleSelect(building.id)}
              className="p-4 rounded-lg bg-bg-tertiary border border-border-subtle hover:border-accent transition-colors text-left"
            >
              <div className="font-medium text-text-primary">{building.name}</div>
              <div className="text-xs text-text-muted mt-1">
                ${cost} · {building.capacity} capacity
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
