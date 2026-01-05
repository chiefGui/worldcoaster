import { useCallback, useMemo } from 'react'
import { useComponent } from '@ecs/react/use-component'
import { StatComponent } from '@framework/stat/stat.component'
import { Park, ParkStat } from '@game/park/park.component'
import { LandAction } from '@game/land/land.action'
import { ConfirmationDialog } from '@ui/component/confirmation-dialog'
import { Toast } from '@ui/component/toast'
import { Format } from '@ui/lib/format'
import { cn } from '@ui/lib/cn'

type LockedLandRowProps = {
  slotsPerRow: number
}

export function LockedLandRow({ slotsPerRow }: LockedLandRowProps) {
  const confirmDialog = ConfirmationDialog.useStore()

  // Track park stats reactively for affordability check
  const parkEntity = Park.entity()
  const parkStats = useComponent(parkEntity, StatComponent)
  const money = parkStats?.values[ParkStat.money] ?? 0
  const unlockedRows = parkStats?.values[ParkStat.unlockedLandRows] ?? 1

  // Recalculate price when unlockedRows changes
  const price = useMemo(() => LandAction.getNextRowPrice(), [unlockedRows])
  const canAfford = money >= price

  const handlePurchase = useCallback(() => {
    const success = LandAction.expand()
    if (success) {
      Toast.success(`New land acquired for ${Format.moneyCompact(price)}!`)
      confirmDialog.hide()
    } else {
      Toast.error('Unable to acquire land')
    }
  }, [price, confirmDialog])

  return (
    <>
      <button
        type="button"
        onClick={() => confirmDialog.show()}
        className={cn(
          'mt-2 max-w-md mx-auto w-full relative',
          'grid gap-2',
          'group cursor-pointer',
          'transition-all duration-200',
          'hover:scale-[1.01]'
        )}
        style={{ gridTemplateColumns: `repeat(${slotsPerRow}, 1fr)` }}
      >
        {/* Locked slot placeholders */}
        {Array.from({ length: slotsPerRow }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'aspect-square rounded-lg border border-dashed',
              'transition-all duration-200',
              canAfford
                ? 'border-accent/30 bg-accent/5 group-hover:border-accent/60 group-hover:bg-accent/10'
                : 'border-border/30 bg-bg-tertiary/20'
            )}
          />
        ))}

        {/* Centered label overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            'flex items-center gap-2',
            'backdrop-blur-sm',
            canAfford
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'bg-bg-secondary/80 text-text-muted border border-border/50'
          )}>
            <LockIcon className="w-3.5 h-3.5" />
            <span>Expand Land</span>
            <span className="font-semibold">{Format.moneyCompact(price)}</span>
          </div>
        </div>
      </button>

      <ConfirmationDialog.Root store={confirmDialog}>
        <ConfirmationDialog.Content>
          <ConfirmationDialog.Heading>Expand Your Park</ConfirmationDialog.Heading>
          <ConfirmationDialog.Description>
            Acquire {slotsPerRow} new land plots for {Format.moneyCompact(price)}?
            {!canAfford && (
              <span className="block mt-2 text-error">
                You need {Format.moneyCompact(price - money)} more to afford this.
              </span>
            )}
          </ConfirmationDialog.Description>
          <ConfirmationDialog.Actions>
            <ConfirmationDialog.Cancel>Cancel</ConfirmationDialog.Cancel>
            <ConfirmationDialog.Confirm
              onClick={handlePurchase}
              disabled={!canAfford}
              className={cn(!canAfford && 'opacity-50 cursor-not-allowed')}
            >
              Purchase
            </ConfirmationDialog.Confirm>
          </ConfirmationDialog.Actions>
        </ConfirmationDialog.Content>
      </ConfirmationDialog.Root>
    </>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  )
}
