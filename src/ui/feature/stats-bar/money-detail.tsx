import { Drawer, type DrawerProps } from '@ui/component/drawer'
import { Format } from '@ui/lib/format'
import { cn } from '@ui/lib/cn'
import { useMoneyStats } from './use-stats'

type MoneyDetailProps = Pick<DrawerProps, 'store'>

export function MoneyDetail({ store }: MoneyDetailProps) {
  const { money, breakdown } = useMoneyStats()
  const { income, expenses, netRate } = breakdown

  return (
    <Drawer.Root store={store}>
      <Drawer.Content side="right" className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Drawer.Heading>Finances</Drawer.Heading>
          <Drawer.Close>&times;</Drawer.Close>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Current Balance */}
          <div className="text-center py-4">
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
                      {Format.moneyCompact(item.amount)}/d
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {income.length === 0 && expenses.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Build attractions to start earning!</p>
            </div>
          )}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  )
}
