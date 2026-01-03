import { useEffect, useMemo, useRef } from 'react'
import type { Entity } from '@ecs/entity'
import { useQuery } from '@ecs/react/use-query'
import { PlotComponent, type PlotData } from '@game/plot/plot.component'
import { PlotAction } from '@game/plot/plot.action'
import { World } from '@ecs/world'
import { PlotSlot } from './plot-slot'

const GRID_SIZE = 6

export type ParkGridProps = {
  onAddBuilding: (plotEntity: Entity) => void
}

export function ParkGrid({ onAddBuilding }: ParkGridProps) {
  const schemas = useMemo(() => [PlotComponent] as const, [])
  const plots = useQuery(schemas)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    if (plots.length > 0) {
      initialized.current = true
      return
    }

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        PlotAction.create(x, y)
      }
    }
    initialized.current = true
  }, [plots.length])

  const sortedPlots = useMemo(() => {
    return [...plots].sort((a, b) => {
      const plotA = World.get(a, PlotComponent) as PlotData
      const plotB = World.get(b, PlotComponent) as PlotData
      if (plotA.y !== plotB.y) return plotA.y - plotB.y
      return plotA.x - plotB.x
    })
  }, [plots])

  return (
    <div className="p-4">
      <div
        className="grid gap-2 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {sortedPlots.map((entity) => (
          <PlotSlot key={entity} entity={entity} onAddBuilding={onAddBuilding} />
        ))}
      </div>
    </div>
  )
}
