import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import type { Entity } from '@ecs/entity'
import { useComponent } from '@ecs/react/use-component'
import {
  BuildingComponent,
  BuildingStatsComponent,
  BuildingRegistry,
} from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { QueueComponent } from '@game/queue/queue.component'
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

  if (!building) return null

  const def = BuildingRegistry.get(building.id)
  if (!def) return null

  const buildCost = BuildingAction.getBuildCost(def)
  const refund = BuildingAction.getRefundAmount(buildingEntity)
  const fee = BuildingAction.getFee(def)

  // Find queue for this building
  const queueLength = findQueueLength(buildingEntity)

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
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </Drawer.Close>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Stats Section */}
        <Section title="Statistics">
          <StatRow label="Total Visits" value={stats?.visits ?? 0} />
          <StatRow label="Revenue Generated" value={`$${stats?.revenue ?? 0}`} />
          <StatRow label="Current Queue" value={queueLength} />
        </Section>

        {/* Building Info Section */}
        <Section title="Building Info">
          <StatRow label="Capacity" value={def.capacity} />
          <StatRow label="Duration" value={`${def.duration}s`} />
          <StatRow label="Original Cost" value={`$${buildCost}`} />
          {fee > 0 && <StatRow label="Entry Fee" value={`$${fee}`} />}
        </Section>

        {/* Effects Section */}
        <Section title="Effects">
          {def.appeal > 0 && (
            <EffectRow label="Park Attractiveness" value={`+${def.appeal}`} positive />
          )}
          {def.on.tick?.park?.money && (
            <EffectRow
              label="Operating Cost"
              value={`$${Math.abs(def.on.tick.park.money)}/day`}
              positive={def.on.tick.park.money > 0}
            />
          )}
          {def.on.visit?.guest && (
            <>
              {def.on.visit.guest.happiness && (
                <EffectRow
                  label="Guest Happiness"
                  value={def.on.visit.guest.happiness > 0 ? `+${def.on.visit.guest.happiness}` : `${def.on.visit.guest.happiness}`}
                  positive={def.on.visit.guest.happiness > 0}
                />
              )}
              {def.on.visit.guest.energy && (
                <EffectRow
                  label="Guest Energy"
                  value={def.on.visit.guest.energy > 0 ? `+${def.on.visit.guest.energy}` : `${def.on.visit.guest.energy}`}
                  positive={def.on.visit.guest.energy > 0}
                />
              )}
            </>
          )}
        </Section>
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
      <div className="bg-bg-tertiary rounded-lg divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

type StatRowProps = {
  label: string
  value: string | number
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
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

export const BuildingInspector = {
  Provider,
  useInspector: useBuildingInspector,
}
