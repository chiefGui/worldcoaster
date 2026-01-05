import { useMemo } from 'react'
import { useQuery } from '@ecs/react/use-query'
import { useComponent } from '@ecs/react/use-component'
import { Drawer, type DrawerProps } from '@ui/component/drawer'
import { StatComponent, Stat } from '@framework/stat/stat.component'
import { GuestComponent, GuestStat } from '@game/guest/guest.component'
import { Park, ParkStat } from '@game/park'
import { cn } from '@ui/lib/cn'
import { useGuestStats } from './use-stats'

type GuestDetailProps = Pick<DrawerProps, 'store'>

export function GuestDetail({ store }: GuestDetailProps) {
  const { current, spawnRate, netRate } = useGuestStats()

  // Get guest happiness data
  const schemas = useMemo(() => [GuestComponent, StatComponent] as const, [])
  const guestEntities = useQuery(schemas)

  // Calculate average happiness
  const avgHappiness = useMemo(() => {
    if (guestEntities.length === 0) return 0
    let total = 0
    for (const entity of guestEntities) {
      total += Stat.get(entity, GuestStat.happiness)
    }
    return Math.round(total / guestEntities.length)
  }, [guestEntities])

  // Get park attractiveness
  const parkStats = useComponent(Park.entity(), StatComponent)
  const attractiveness = parkStats?.values[ParkStat.attractiveness] ?? 0
  const novelty = parkStats?.values[ParkStat.novelty] ?? 0

  return (
    <Drawer.Root store={store}>
      <Drawer.Content side="right" className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Drawer.Heading>Guests</Drawer.Heading>
          <Drawer.Close>&times;</Drawer.Close>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Current Count */}
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-text-primary tabular-nums">
              {current}
            </div>
            <div className="text-sm text-text-secondary">guests in park</div>
            <div
              className={cn(
                'text-sm font-medium mt-1 tabular-nums',
                netRate > 0 && 'text-success',
                netRate < 0 && 'text-error',
                netRate === 0 && 'text-text-muted'
              )}
            >
              {netRate >= 0 ? '+' : ''}{netRate.toFixed(1)}/day
            </div>
          </div>

          {/* Key Metrics */}
          <section>
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
              Metrics
            </h3>
            <div className="space-y-1">
              <MetricRow
                label="Avg Happiness"
                value={`${avgHappiness}%`}
                status={avgHappiness >= 70 ? 'good' : avgHappiness >= 40 ? 'warning' : 'bad'}
              />
              <MetricRow
                label="Spawn Rate"
                value={`${spawnRate.toFixed(1)}/day`}
                status="neutral"
              />
              <MetricRow
                label="Attractiveness"
                value={attractiveness.toString()}
                status="neutral"
              />
              <MetricRow
                label="Novelty"
                value={novelty.toFixed(0)}
                status={novelty >= 50 ? 'good' : novelty >= 20 ? 'warning' : 'bad'}
              />
            </div>
          </section>

          {/* Tips */}
          {current === 0 && (
            <div className="text-center py-4 text-text-muted">
              <p className="text-sm">No guests yet</p>
              <p className="text-xs mt-1">Build attractions to increase appeal!</p>
            </div>
          )}

          {avgHappiness > 0 && avgHappiness < 40 && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning">
                Guest happiness is low. Consider adding more variety!
              </p>
            </div>
          )}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  )
}

type MetricRowProps = {
  label: string
  value: string
  status: 'good' | 'warning' | 'bad' | 'neutral'
}

function MetricRow({ label, value, status }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-bg-tertiary">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={cn(
          'text-sm font-medium tabular-nums',
          status === 'good' && 'text-success',
          status === 'warning' && 'text-warning',
          status === 'bad' && 'text-error',
          status === 'neutral' && 'text-text-primary'
        )}
      >
        {value}
      </span>
    </div>
  )
}
