import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import type { Entity } from '@ecs/entity'
import { useComponent } from '@ecs/react/use-component'
import { useTick } from '@ecs/react/use-world'
import {
  BuildingComponent,
  BuildingStatsComponent,
  BuildingRegistry,
} from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { QueueComponent } from '@game/queue/queue.component'
import { GuestComponent, Guest, GuestState } from '@game/guest/guest.component'
import { World } from '@ecs/world'
import { Drawer } from '@ui/component/drawer'
import { ConfirmationDialog } from '@ui/component/confirmation-dialog'
import { Button } from '@ui/component/button'
import { Toast } from '@ui/component/toast'
import { cn } from '@ui/lib/cn'

type BuildingInspectorContextValue = {
  inspectBuilding: (buildingEntity: Entity) => void
  closeInspector: () => void
  inspectedBuilding: Entity | null
}

const BuildingInspectorContext = createContext<BuildingInspectorContextValue | null>(null)

export function useBuildingInspector() {
  const context = useContext(BuildingInspectorContext)
  if (!context) {
    throw new Error('useBuildingInspector must be used within BuildingInspector.Provider')
  }
  return context
}

export type BuildingInspectorProviderProps = {
  children: ReactNode
}

function Provider({ children }: BuildingInspectorProviderProps) {
  const [inspectedBuilding, setInspectedBuilding] = useState<Entity | null>(null)
  const drawerStore = Drawer.useStore()
  const confirmationStore = ConfirmationDialog.useStore()

  const inspectBuilding = useCallback(
    (buildingEntity: Entity) => {
      setInspectedBuilding(buildingEntity)
      drawerStore.show()
    },
    [drawerStore]
  )

  const closeInspector = useCallback(() => {
    drawerStore.hide()
    setInspectedBuilding(null)
  }, [drawerStore])

  const handleDemolishClick = useCallback(() => {
    confirmationStore.show()
  }, [confirmationStore])

  const handleConfirmDemolish = useCallback(() => {
    if (!inspectedBuilding) return

    const def = BuildingAction.getDefinition({ entity: inspectedBuilding })
    const refund = BuildingAction.demolish({ buildingEntity: inspectedBuilding, source: 'player' })

    confirmationStore.hide()
    drawerStore.hide()
    setInspectedBuilding(null)

    Toast.success(`${def?.name ?? 'Building'} demolished! +$${refund} refunded`)
  }, [inspectedBuilding, confirmationStore, drawerStore])

  return (
    <BuildingInspectorContext.Provider
      value={{
        inspectBuilding,
        closeInspector,
        inspectedBuilding,
      }}
    >
      {children}

      <Drawer.Root store={drawerStore}>
        <Drawer.Content side="right" className="flex flex-col">
          {inspectedBuilding && (
            <InspectorPanel
              buildingEntity={inspectedBuilding}
              onDemolish={handleDemolishClick}
            />
          )}
        </Drawer.Content>
      </Drawer.Root>

      <ConfirmationDialog.Root store={confirmationStore}>
        <DemolishConfirmation
          buildingEntity={inspectedBuilding}
          onConfirm={handleConfirmDemolish}
        />
      </ConfirmationDialog.Root>
    </BuildingInspectorContext.Provider>
  )
}

type InspectorPanelProps = {
  buildingEntity: Entity
  onDemolish: () => void
}

function InspectorPanel({ buildingEntity, onDemolish }: InspectorPanelProps) {
  const building = useComponent(buildingEntity, BuildingComponent)
  const stats = useComponent(buildingEntity, BuildingStatsComponent)

  // Live stats that update every tick
  const liveStats = useTick(
    useCallback(() => {
      return {
        riding: countGuestsRiding(buildingEntity),
        queued: findQueueLength(buildingEntity),
      }
    }, [buildingEntity])
  )

  if (!building) return null

  const def = BuildingRegistry.get(building.id)
  if (!def) return null

  const refund = BuildingAction.getRefundAmount(buildingEntity)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {def.icon && <img src={def.icon} alt="" className="w-10 h-10" />}
            <div>
              <Drawer.Heading>{def.name}</Drawer.Heading>
              <span className="text-xs text-text-muted capitalize">{def.category}</span>
            </div>
          </div>
          <Drawer.Close className="size-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
            &times;
          </Drawer.Close>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Live Activity - Big numbers */}
        <div className="grid grid-cols-3 gap-2">
          <LiveStat label="Riding" value={liveStats.riding} icon="🎢" />
          <LiveStat label="Queued" value={liveStats.queued} icon="🚶" />
          <LiveStat label="Total" value={stats?.visits ?? 0} icon="🎟️" />
        </div>

        {/* Revenue */}
        {(stats?.revenue ?? 0) > 0 && (
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-success">${stats?.revenue ?? 0}</div>
            <div className="text-xs text-success/80">Revenue Generated</div>
          </div>
        )}

        {/* Quick Info */}
        <Section title="Info">
          <StatRow label="Capacity" value={`${def.capacity} guests`} />
          <StatRow label="Ride Duration" value={`${def.duration} sec`} />
          {def.appeal > 0 && (
            <StatRow label="Park Appeal" value={`+${def.appeal}`} highlight />
          )}
        </Section>

        {/* Guest Effects */}
        {def.on.visit?.guest && (
          <Section title="Guest Effects">
            {Object.entries(def.on.visit.guest).map(([stat, value]) => (
              <EffectRow
                key={stat}
                label={stat.charAt(0).toUpperCase() + stat.slice(1)}
                value={value > 0 ? `+${value}` : `${value}`}
                positive={value > 0}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="text-sm text-text-secondary text-center">
          Demolishing will refund <span className="text-success font-medium">${refund}</span> (50%)
        </div>
        <Button
          variant="secondary"
          className="w-full bg-error/10 text-error hover:bg-error/20 border border-error/30"
          onClick={onDemolish}
        >
          Demolish Building
        </Button>
      </div>
    </div>
  )
}

type DemolishConfirmationProps = {
  buildingEntity: Entity | null
  onConfirm: () => void
}

function DemolishConfirmation({ buildingEntity, onConfirm }: DemolishConfirmationProps) {
  if (!buildingEntity) return null

  const def = BuildingAction.getDefinition({ entity: buildingEntity })
  const refund = BuildingAction.getRefundAmount(buildingEntity)

  return (
    <ConfirmationDialog.Content variant="danger">
      <ConfirmationDialog.Heading>Demolish {def?.name ?? 'Building'}?</ConfirmationDialog.Heading>
      <ConfirmationDialog.Description>
        You'll receive ${refund} refund (50% of original cost). This action cannot be undone.
      </ConfirmationDialog.Description>
      <ConfirmationDialog.Actions>
        <ConfirmationDialog.Cancel />
        <ConfirmationDialog.Confirm variant="danger" onClick={onConfirm}>
          Demolish
        </ConfirmationDialog.Confirm>
      </ConfirmationDialog.Actions>
    </ConfirmationDialog.Content>
  )
}

// Helper Components

type LiveStatProps = {
  label: string
  value: number
  icon: string
}

function LiveStat({ label, value, icon }: LiveStatProps) {
  return (
    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}

type SectionProps = {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="bg-bg-tertiary rounded-lg divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  )
}

type StatRowProps = {
  label: string
  value: string | number
  highlight?: boolean
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn('text-sm font-medium', highlight ? 'text-accent' : 'text-text-primary')}>
        {value}
      </span>
    </div>
  )
}

type EffectRowProps = {
  label: string
  value: string
  positive: boolean
}

function EffectRow({ label, value, positive }: EffectRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn('text-sm font-medium', positive ? 'text-success' : 'text-error')}>
        {value}
      </span>
    </div>
  )
}

// Helper to find queue length for a building
function findQueueLength(buildingEntity: Entity): number {
  const queueQuery = World.createQuery([QueueComponent])
  for (const queueEntity of World.query(queueQuery)) {
    const queue = World.get(queueEntity, QueueComponent)
    if (queue?.buildingEntity === buildingEntity) {
      return queue.guests.length
    }
  }
  return 0
}

// Helper to count guests currently riding at a building
function countGuestsRiding(buildingEntity: Entity): number {
  const guestQuery = World.createQuery([GuestComponent])
  let count = 0
  for (const guestEntity of World.query(guestQuery)) {
    if (Guest.is(guestEntity, GuestState.riding) && Guest.target(guestEntity) === buildingEntity) {
      count++
    }
  }
  return count
}

export const BuildingInspector = {
  Provider,
  useInspector: useBuildingInspector,
}
