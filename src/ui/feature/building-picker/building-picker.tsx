import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Entity } from '@ecs/entity'
import {
  BuildingRegistry,
  type BuildingId,
  type BuildingDefinition,
} from '@game/building/building.component'
import { BuildingAction } from '@game/building/building.action'
import { Park } from '@game/park'
import { Drawer } from '@ui/component/drawer'
import { cn } from '@ui/lib/cn'

export type BuildingPickerProps = {
  plotEntity: Entity | null
  onSelect: (buildingId: BuildingId) => void
}

export function BuildingPicker({ onSelect }: BuildingPickerProps) {
  const [selectedId, setSelectedId] = useState<BuildingId | null>(null)
  const buildings = BuildingRegistry.all()
  const selectedBuilding = selectedId ? BuildingRegistry.get(selectedId) : null

  if (selectedBuilding) {
    return (
      <BuildingDetail
        building={selectedBuilding}
        onBack={() => setSelectedId(null)}
        onBuy={() => onSelect(selectedBuilding.id)}
      />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Drawer.Heading>Build</Drawer.Heading>
        <Drawer.Close>&times;</Drawer.Close>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {buildings.map((building) => (
            <BuildingListItem
              key={building.id}
              building={building}
              onSelect={() => setSelectedId(building.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

type BuildingListItemProps = {
  building: BuildingDefinition
  onSelect: () => void
}

function BuildingListItem({ building, onSelect }: BuildingListItemProps) {
  const cost = BuildingAction.getBuildCost(building)
  const canAfford = Park.canAfford(cost)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="p-4 rounded-lg bg-bg-tertiary border border-border-subtle hover:border-accent transition-colors text-left flex items-center gap-3"
    >
      {building.icon && (
        <img src={building.icon} alt="" className="w-10 h-10 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary">{building.name}</div>
        <div className="text-xs text-text-muted mt-1">
          {building.capacity} guests · {building.category}
        </div>
      </div>
      <div
        className={cn(
          'text-lg font-semibold',
          canAfford ? 'text-success' : 'text-text-muted'
        )}
      >
        ${cost}
      </div>
    </button>
  )
}

type BuildingDetailProps = {
  building: BuildingDefinition
  onBack: () => void
  onBuy: () => void
}

function BuildingDetail({ building, onBack, onBuy }: BuildingDetailProps) {
  const cost = BuildingAction.getBuildCost(building)
  const canAfford = Park.canAfford(cost)
  const upkeep = Math.abs(building.on.tick?.park?.money ?? 0)
  const guestEffects = building.on.visit?.guest ?? {}

  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Back to list"
        >
          <ChevronLeft className="size-5" />
        </button>
        <Drawer.Heading>{building.name}</Drawer.Heading>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center mb-6">
          {building.icon && (
            <img src={building.icon} alt="" className="w-20 h-20 mb-3" />
          )}
          <div
            className={cn(
              'text-3xl font-bold',
              canAfford ? 'text-success' : 'text-text-muted'
            )}
          >
            ${cost}
          </div>
          {!canAfford && (
            <p className="text-sm text-error mt-1">Not enough funds</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <StatRow label="Category" value={building.category} />
          <StatRow label="Capacity" value={`${building.capacity} guests`} />
          <StatRow label="Appeal" value={`+${building.appeal}`} />
          {upkeep > 0 && (
            <StatRow label="Upkeep" value={`$${upkeep}/day`} />
          )}
        </div>

        {Object.keys(guestEffects).length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-medium text-text-secondary mb-2">
              Guest Effects
            </div>
            <div className="space-y-2">
              {Object.entries(guestEffects).map(([stat, value]) => (
                <div
                  key={stat}
                  className="flex justify-between text-sm px-3 py-2 bg-bg-tertiary rounded-lg"
                >
                  <span className="text-text-secondary capitalize">{stat}</span>
                  <span
                    className={cn(
                      'font-medium',
                      value > 0 ? 'text-success' : 'text-error'
                    )}
                  >
                    {value > 0 ? '+' : ''}
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={onBuy}
          disabled={!canAfford}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-semibold transition-colors',
            canAfford
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          )}
        >
          {canAfford ? 'Buy' : 'Cannot Afford'}
        </button>
      </div>
    </>
  )
}

type StatRowProps = {
  label: string
  value: string
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between text-sm px-3 py-2 bg-bg-tertiary rounded-lg">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium capitalize">{value}</span>
    </div>
  )
}
