import { useCallback } from 'react'
import { Drawer, type DrawerProps } from '@ui/component/drawer'
import { Format } from '@ui/lib/format'
import { cn } from '@ui/lib/cn'
import { ParkAction } from '@game/park/park.action'
import { Sparkline } from './sparkline'
import { useMoneyStats } from './use-stats'

type MoneyDetailProps = Pick<DrawerProps, 'store'>

export function MoneyDetail({ store }: MoneyDetailProps) {
  const { money, breakdown, entryFee } = useMoneyStats()
  const { income, expenses, netRate, incomeHistory, entryFeeIncome } = breakdown

  const handleFeeChange = useCallback((delta: number) => {
    const newFee = Math.max(0, entryFee + delta)
    ParkAction.setEntryFee({ amount: newFee, source: 'player' })
  }, [entryFee])

  return (
    <Drawer.Root store={store}>
      <Drawer.Content side="right" className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Drawer.Heading>Finances</Drawer.Heading>
          <Drawer.Close>&times;</Drawer.Close>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Current Balance */}
          <div className="text-center py-3">
            <div className="text-3xl font-bold text-text-primary tabular-nums">
              {Format.moneyCompact(money)}
            </div>
            <div
              className={cn(
                'text-sm font-medium mt-1 tabular-nums',
                netRate > 0 && 'text-success',
                netRate < 0 && 'text-error',
                netRate === 0 && 'text-text-muted'
              )}
            >
              {netRate >= 0 ? '+' : ''}{Format.moneyCompact(netRate)}/day
            </div>
          </div>

          {/* Income Trend */}
          <section className="bg-bg-tertiary rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Last 30 Days
              </span>
            </div>
            <div className="flex justify-center">
              <Sparkline data={incomeHistory} width={200} height={40} />
            </div>
          </section>

          {/* Entry Fee Control */}
          <section className="bg-bg-tertiary rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text-primary">Entry Fee</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {entryFeeIncome > 0 ? (
                    <span className="text-success">+{Format.moneyCompact(entryFeeIncome)}/day</span>
                  ) : (
                    'Per guest admission'
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFeeChange(-1)}
                  disabled={entryFee <= 0}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-bg-secondary border border-border-subtle',
                    'text-text-primary font-medium text-lg',
                    'hover:bg-bg-primary hover:border-border transition-colors',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  −
                </button>
                <div className="w-16 text-center">
                  <span className="text-lg font-semibold text-text-primary tabular-nums">
                    ${entryFee}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeeChange(1)}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-bg-secondary border border-border-subtle',
                    'text-text-primary font-medium text-lg',
                    'hover:bg-bg-primary hover:border-border transition-colors'
                  )}
                >
                  +
                </button>
              </div>
            </div>
          </section>

          {/* Income Section */}
          {income.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                Income
              </h3>
              <div className="space-y-1">
                {income.map((item) => (
                  <div
                    key={item.source}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-bg-tertiary"
                  >
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-success tabular-nums">
                      +{Format.moneyCompact(item.amount)}/d
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Expenses Section */}
          {expenses.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                Expenses
              </h3>
              <div className="space-y-1">
                {expenses.map((item) => (
                  <div
                    key={item.source}
                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-bg-tertiary"
                  >
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-error tabular-nums">
                      -{Format.moneyCompact(item.amount)}/d
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {income.length === 0 && expenses.length === 0 && (
            <div className="text-center py-6 text-text-muted">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Build attractions to start earning!</p>
            </div>
          )}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  )
}
