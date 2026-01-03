import { useState, useEffect, useRef } from 'react'
import type { Entity } from '@ecs/entity'
import { PlotAction } from '@game/plot/plot.action'
import { PlotSlot } from './plot-slot'

const GRID_SIZE = 6
const PLOT_COUNT = GRID_SIZE * GRID_SIZE

export function ParkGrid() {
  const [plots, setPlots] = useState<Entity[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const entities: Entity[] = []
    for (let i = 0; i < PLOT_COUNT; i++) {
      entities.push(PlotAction.create())
    }
    setPlots(entities)
  }, [])

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
