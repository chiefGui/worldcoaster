import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { useNavigation } from './context'
import { cn } from '@ui/lib/cn'

export type NavigationMenuItemProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  to?: string
  icon?: ReactNode
  children: ReactNode
  description?: string
}

export const NavigationMenuItem = forwardRef<HTMLButtonElement, NavigationMenuItemProps>(
  ({ to, icon, children, description, className, onClick, ...props }, ref) => {
    const { to: navigate } = useNavigation()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (to) {
        navigate(to)
      }
      onClick?.(e)
    }

    const hasSubmenu = !!to

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3',
          'text-left transition-colors',
          'hover:bg-bg-tertiary active:bg-bg-tertiary',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
          className
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 size-5 text-text-secondary">{icon}</span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-text-primary truncate">
            {children}
          </span>
          {description && (
            <span className="block text-xs text-text-muted truncate mt-0.5">
              {description}
            </span>
          )}
        </span>
        {hasSubmenu && (
          <ChevronRight className="shrink-0 size-4 text-text-muted" />
        )}
      </button>
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenu.Item'
