import { useState, useEffect, useMemo } from 'react'
import type { Entity } from '@ecs/entity'
import { useQuery } from '@ecs/react/use-query'
import { useComponent } from '@ecs/react/use-component'
import { CONFIG } from '@framework/config'
import { StatComponent } from '@framework/stat/stat.component'
import { PlotAction } from '@game/plot/plot.action'
import { PlotComponent } from '@game/plot/plot.component'
import { Park, ParkStat } from '@game/park/park.component'
import { LandAction } from '@game/land/land.action'
import { PlotSlot } from './plot-slot'
import { LockedLandRow } from './locked-land-row'

const SLOTS_PER_ROW = CONFIG.land.slotsPerRow

export function ParkGrid() {
  const schemas = useMemo(() => [PlotComponent] as const, [])
  const existingPlots = useQuery(schemas)
  const [plots, setPlots] = useState<Entity[]>([])

  // Track park stats to reactively update when unlockedLandRows changes
  const parkEntity = Park.entity()
  const parkStats = useComponent(parkEntity, StatComponent)
  const unlockedRows = parkStats?.values[ParkStat.unlockedLandRows] ?? CONFIG.park.initial.unlockedLandRows
  const expectedPlotCount = unlockedRows * SLOTS_PER_ROW

  // Memoize to avoid recreating on every render
  const isAtMaxRows = useMemo(() => LandAction.isAtMaxRows(), [unlockedRows])

  useEffect(() => {
    // If plots already exist (from loaded save), use them
    if (existingPlots.length > 0) {
      setPlots([...existingPlots])
      return
    }

    // Only create new plots if none exist
    if (plots.length === 0) {
      const entities: Entity[] = []
      for (let i = 0; i < expectedPlotCount; i++) {
        entities.push(PlotAction.create())
      }
      setPlots(entities)
    }
  }, [existingPlots, plots.length, expectedPlotCount])

  // Update plots when new ones are created (after expansion)
  useEffect(() => {
    if (existingPlots.length > plots.length) {
      setPlots([...existingPlots])
    }
  }, [existingPlots.length, plots.length])

  return (
    <div className="p-4">
      <div
        className="grid gap-2 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${SLOTS_PER_ROW}, 1fr)` }}
      >
        {plots.map((entity) => (
          <PlotSlot key={entity} entity={entity} />
        ))}
      </div>

      {/* Show locked row preview if not at max */}
      {!isAtMaxRows && (
        <LockedLandRow slotsPerRow={SLOTS_PER_ROW} />
      )}
    </div>
  )
}
