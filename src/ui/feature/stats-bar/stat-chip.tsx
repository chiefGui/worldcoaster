import type { ReactNode } from 'react'
import { cn } from '@ui/lib/cn'

export type StatChipProps = {
  icon: ReactNode
  value: string
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  onClick?: () => void
}

export function StatChip({ icon, value, delta, deltaType = 'neutral', onClick }: StatChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-bg-tertiary/50 border border-border-subtle',
        'hover:bg-bg-tertiary hover:border-border',
        'transition-all duration-150',
        'group cursor-pointer'
      )}
    >
      <span className="text-text-secondary group-hover:text-text-primary transition-colors">
        {icon}
      </span>
      <div className="flex flex-col items-start leading-none">
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[10px] font-medium tabular-nums',
              deltaType === 'positive' && 'text-success',
              deltaType === 'negative' && 'text-error',
              deltaType === 'neutral' && 'text-text-muted'
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </button>
  )
}
