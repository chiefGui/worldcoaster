import { type ReactNode } from 'react'
import { cn } from '@ui/lib/cn'

export type NavigationMenuSectionProps = {
  title?: string
  children: ReactNode
  className?: string
}

export function NavigationMenuSection({
  title,
  children,
  className,
}: NavigationMenuSectionProps) {
  return (
    <div className={cn('py-2', className)}>
      {title && (
        <div className="px-4 py-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
