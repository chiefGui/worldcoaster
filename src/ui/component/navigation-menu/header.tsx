import { type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigation } from './context'
import { cn } from '@ui/lib/cn'

export type NavigationMenuHeaderProps = {
  title?: ReactNode
  children?: ReactNode
  className?: string
  showBack?: boolean
}

export function NavigationMenuHeader({
  title,
  children,
  className,
  showBack = true,
}: NavigationMenuHeaderProps) {
  const { canGoBack, back, current, getPanelTitle } = useNavigation()

  const displayTitle = title ?? getPanelTitle(current)
  const shouldShowBack = showBack && canGoBack

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 border-b border-border-subtle',
        'bg-bg-secondary',
        className
      )}
    >
      {shouldShowBack && (
        <button
          type="button"
          onClick={back}
          className={cn(
            'shrink-0 size-8 -ml-2 flex items-center justify-center rounded-lg',
            'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            'transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {displayTitle && (
        <h2 className="flex-1 text-base font-semibold text-text-primary truncate">
          {displayTitle}
        </h2>
      )}
      {children}
    </div>
  )
}
