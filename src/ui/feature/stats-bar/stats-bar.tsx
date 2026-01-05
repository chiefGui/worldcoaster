import { Drawer } from '@ui/component/drawer'
import { Format } from '@ui/lib/format'
import { StatChip } from './stat-chip'
import { MoneyDetail } from './money-detail'
import { GuestDetail } from './guest-detail'
import { useMoneyStats, useGuestStats } from './use-stats'

function MoneyIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
    </svg>
  )
}

function GuestIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  )
}

export function StatsBar() {
  const moneyDrawer = Drawer.useStore()
  const guestDrawer = Drawer.useStore()

  const { money, breakdown } = useMoneyStats()
  const guestStats = useGuestStats()

  const moneyDelta = breakdown.netRate
  const moneyDeltaType = moneyDelta > 0 ? 'positive' : moneyDelta < 0 ? 'negative' : 'neutral'
  const moneyDeltaStr = `${moneyDelta >= 0 ? '+' : ''}${Format.moneyCompact(moneyDelta)}/d`

  const guestDelta = guestStats.netRate
  const guestDeltaType = guestDelta > 0 ? 'positive' : guestDelta < 0 ? 'negative' : 'neutral'
  const guestDeltaStr = `${guestDelta >= 0 ? '+' : ''}${guestDelta.toFixed(1)}/d`

  return (
    <>
      <div className="flex items-center justify-center gap-3 px-4 py-2 bg-bg-primary border-b border-border-subtle">
        <StatChip
          icon={<MoneyIcon />}
          value={Format.moneyCompact(money)}
          delta={moneyDeltaStr}
          deltaType={moneyDeltaType}
          onClick={() => moneyDrawer.show()}
        />
        <StatChip
          icon={<GuestIcon />}
          value={guestStats.current.toString()}
          delta={guestDeltaStr}
          deltaType={guestDeltaType}
          onClick={() => guestDrawer.show()}
        />
      </div>

      <MoneyDetail store={moneyDrawer} />
      <GuestDetail store={guestDrawer} />
    </>
  )
}
