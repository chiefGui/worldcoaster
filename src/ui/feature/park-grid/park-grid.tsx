import { useState, useEffect, useMemo } from 'react'
import type { Entity } from '@ecs/entity'
import { useQuery } from '@ecs/react/use-query'
import { PlotAction } from '@game/plot/plot.action'
import { PlotComponent } from '@game/plot/plot.component'
import { PlotSlot } from './plot-slot'

const GRID_SIZE = 6
const PLOT_COUNT = GRID_SIZE * GRID_SIZE

export function ParkGrid() {
  const schemas = useMemo(() => [PlotComponent] as const, [])
  const existingPlots = useQuery(schemas)
  const [plots, setPlots] = useState<Entity[]>([])

  useEffect(() => {
    // If plots already exist (from loaded save), use them
    if (existingPlots.length > 0) {
      setPlots([...existingPlots])
      return
    }

    // Only create new plots if none exist
    if (plots.length === 0) {
      const entities: Entity[] = []
      for (let i = 0; i < PLOT_COUNT; i++) {
        entities.push(PlotAction.create())
      }
      setPlots(entities)
    }
  }, [existingPlots, plots.length])

  return (
    <div className="p-4">
      <div
        className="grid gap-2 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {plots.map((entity) => (
          <PlotSlot key={entity} entity={entity} />
        ))}
      </div>
    </div>
  )
}
