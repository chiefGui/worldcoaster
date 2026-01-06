import { useState, createContext, useContext, type ReactNode } from 'react'
import { ChevronLeft, Check, Lock, Sparkles } from 'lucide-react'
import { useComponent } from '@ecs/react/use-component'
import { StatComponent } from '@framework/stat/stat.component'
import { GameTime } from '@framework/time'
import { Park } from '@game/park'
import {
  Perk,
  PerkRegistry,
  PerkAction,
  PerkStateComponent,
  type PerkId,
  type PerkDefinition,
  type PerkCategory,
} from '@game/perk'
import { Drawer } from '@ui/component/drawer'
import { ConfirmationDialog } from '@ui/component/confirmation-dialog'
import { Toast } from '@ui/component/toast'
import { cn } from '@ui/lib/cn'

// Context for managing perk panel state
type PerkPanelContextValue = {
  openPanel: () => void
  closePanel: () => void
}

const PerkPanelContext = createContext<PerkPanelContextValue | null>(null)

export function usePerkPanel() {
  const context = useContext(PerkPanelContext)
  if (!context) {
    throw new Error('usePerkPanel must be used within PerkPanel.Provider')
  }
  return context
}

type PerkPanelProviderProps = {
  children: ReactNode
}

function Provider({ children }: PerkPanelProviderProps) {
  const drawerStore = Drawer.useStore()

  const openPanel = () => drawerStore.show()
  const closePanel = () => drawerStore.hide()

  return (
    <PerkPanelContext.Provider value={{ openPanel, closePanel }}>
      {children}
      <Drawer.Root store={drawerStore}>
        <Drawer.Content side="right" className="flex flex-col">
          <PerkPanelContent />
        </Drawer.Content>
      </Drawer.Root>
    </PerkPanelContext.Provider>
  )
}

function PerkPanelContent() {
  const [selectedId, setSelectedId] = useState<PerkId | null>(null)
  const perks = PerkRegistry.all()
  const selectedPerk = selectedId ? PerkRegistry.get(selectedId) : null

  // Subscribe to park stats for reactive updates
  const parkEntity = Park.entity()
  useComponent(parkEntity, StatComponent)
  useComponent(parkEntity, PerkStateComponent)

  if (selectedPerk) {
    return (
      <PerkDetail
        perk={selectedPerk}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  // Group perks by category
  const categories: PerkCategory[] = ['management', 'economy', 'guest', 'park']
  const perksByCategory = categories
    .map((category) => ({
      category,
      perks: perks.filter((p) => p.category === category),
    }))
    .filter((group) => group.perks.length > 0)

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-accent" />
          <Drawer.Heading>Perks</Drawer.Heading>
        </div>
        <Drawer.Close>&times;</Drawer.Close>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {perksByCategory.map(({ category, perks }) => (
          <div key={category}>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              {getCategoryLabel(category)}
            </h3>
            <div className="space-y-2">
              {perks.map((perk) => (
                <PerkListItem
                  key={perk.id}
                  perk={perk}
                  onSelect={() => setSelectedId(perk.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

type PerkListItemProps = {
  perk: PerkDefinition
  onSelect: () => void
}

function PerkListItem({ perk, onSelect }: PerkListItemProps) {
  const isPurchased = Perk.isPurchased(perk.id)
  const meetsRequirements = Perk.meetsRequirements(perk)
  const canAfford = Park.canAfford(perk.cost)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full p-3 rounded-lg border text-left transition-colors',
        isPurchased
          ? 'bg-success/10 border-success/30'
          : meetsRequirements
            ? 'bg-bg-tertiary border-border-subtle hover:border-accent'
            : 'bg-bg-tertiary/50 border-border-subtle opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'size-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isPurchased ? 'bg-success/20 text-success' : 'bg-bg-secondary text-text-muted'
          )}
        >
          {isPurchased ? (
            <Check className="size-4" />
          ) : !meetsRequirements ? (
            <Lock className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-text-primary text-sm">{perk.name}</span>
            {!isPurchased && (
              <span
                className={cn(
                  'text-sm font-semibold flex-shrink-0',
                  canAfford && meetsRequirements ? 'text-success' : 'text-text-muted'
                )}
              >
                ${perk.cost}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{perk.description}</p>
        </div>
      </div>
    </button>
  )
}

type PerkDetailProps = {
  perk: PerkDefinition
  onBack: () => void
}

function PerkDetail({ perk, onBack }: PerkDetailProps) {
  const confirmDialog = ConfirmationDialog.useStore()

  const isPurchased = Perk.isPurchased(perk.id)
  const meetsRequirements = Perk.meetsRequirements(perk)
  const canAfford = Park.canAfford(perk.cost)
  const canPurchase = !isPurchased && meetsRequirements && canAfford

  const handlePurchase = () => {
    const success = PerkAction.purchase(perk.id)
    if (success) {
      Toast.success(`${perk.name} unlocked!`)
      confirmDialog.hide()
    } else {
      Toast.error('Unable to purchase perk')
    }
  }

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
        <Drawer.Heading>{perk.name}</Drawer.Heading>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className={cn(
              'size-16 rounded-2xl flex items-center justify-center mb-3',
              isPurchased ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'
            )}
          >
            {isPurchased ? <Check className="size-8" /> : <Sparkles className="size-8" />}
          </div>

          {isPurchased ? (
            <div className="text-success font-semibold">Purchased</div>
          ) : (
            <>
              <div
                className={cn(
                  'text-3xl font-bold',
                  canAfford ? 'text-success' : 'text-text-muted'
                )}
              >
                ${perk.cost}
              </div>
              {!canAfford && (
                <p className="text-sm text-error mt-1">Not enough funds</p>
              )}
            </>
          )}
        </div>

        <div className="bg-bg-tertiary rounded-lg p-4 mb-4">
          <p className="text-sm text-text-secondary">{perk.description}</p>
        </div>

        <div className="space-y-3 mb-4">
          <StatRow label="Category" value={getCategoryLabel(perk.category)} />
        </div>

        {perk.requirements && !isPurchased && (
          <div>
            <div className="text-sm font-medium text-text-secondary mb-2">Requirements</div>
            <div className="space-y-2">
              {perk.requirements.minMoney !== undefined && (
                <RequirementRow
                  label="Minimum funds"
                  value={`$${perk.requirements.minMoney}`}
                  met={Park.money() >= perk.requirements.minMoney}
                />
              )}
              {perk.requirements.minDay !== undefined && (
                <RequirementRow
                  label="Day reached"
                  value={`Day ${perk.requirements.minDay}`}
                  met={GameTime.getTotalDays() >= perk.requirements.minDay}
                />
              )}
              {perk.requirements.minGuests !== undefined && (
                <RequirementRow
                  label="Guests in park"
                  value={`${perk.requirements.minGuests} guests`}
                  met={Perk.getGuestCount() >= perk.requirements.minGuests}
                />
              )}
              {perk.requirements.minAttractiveness !== undefined && (
                <RequirementRow
                  label="Park attractiveness"
                  value={`${perk.requirements.minAttractiveness}+`}
                  met={Park.attractiveness() >= perk.requirements.minAttractiveness}
                />
              )}
              {perk.requirements.requiredPerks?.map((requiredId) => {
                const requiredPerk = PerkRegistry.get(requiredId)
                return (
                  <RequirementRow
                    key={requiredId}
                    label="Requires perk"
                    value={requiredPerk?.name ?? requiredId}
                    met={Perk.isPurchased(requiredId)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {!isPurchased && (
        <div className="p-4 border-t border-border">
          <button
            type="button"
            onClick={() => confirmDialog.show()}
            disabled={!canPurchase}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-semibold transition-colors',
              canPurchase
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            )}
          >
            {!meetsRequirements
              ? 'Requirements Not Met'
              : !canAfford
                ? 'Cannot Afford'
                : 'Purchase'}
          </button>
        </div>
      )}

      <ConfirmationDialog.Root store={confirmDialog}>
        <ConfirmationDialog.Content>
          <ConfirmationDialog.Heading>Purchase {perk.name}?</ConfirmationDialog.Heading>
          <ConfirmationDialog.Description>
            This will cost ${perk.cost}. This action cannot be undone.
          </ConfirmationDialog.Description>
          <ConfirmationDialog.Actions>
            <ConfirmationDialog.Cancel />
            <ConfirmationDialog.Confirm onClick={handlePurchase}>
              Purchase
            </ConfirmationDialog.Confirm>
          </ConfirmationDialog.Actions>
        </ConfirmationDialog.Content>
      </ConfirmationDialog.Root>
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
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}

type RequirementRowProps = {
  label: string
  value: string
  met: boolean
}

function RequirementRow({ label, value, met }: RequirementRowProps) {
  return (
    <div className="flex justify-between items-center text-sm px-3 py-2 bg-bg-tertiary rounded-lg">
      <span className="text-text-secondary">{label}</span>
      <span className={cn('font-medium', met ? 'text-success' : 'text-error')}>
        {value} {met ? '✓' : '✗'}
      </span>
    </div>
  )
}

function getCategoryLabel(category: PerkCategory): string {
  const labels: Record<PerkCategory, string> = {
    management: 'Management',
    economy: 'Economy',
    guest: 'Guest Experience',
    park: 'Park',
  }
  return labels[category]
}

export const PerkPanel = {
  Provider,
  usePerkPanel,
}
