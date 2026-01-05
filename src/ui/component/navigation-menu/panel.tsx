import { useEffect, type ReactNode } from 'react'
import { useNavigation } from './context'
import { cn } from '@ui/lib/cn'

export type NavigationMenuPanelProps = {
  id: string
  parent?: string
  title?: string
  children: ReactNode
  className?: string
}

export function NavigationMenuPanel({
  id,
  parent,
  title,
  children,
  className,
}: NavigationMenuPanelProps) {
  const { current, direction, registerPanel } = useNavigation()

  useEffect(() => {
    registerPanel(id, parent, title)
  }, [id, parent, title, registerPanel])

  const isActive = current === id

  if (!isActive) return null

  return (
    <div
      data-panel={id}
      data-direction={direction}
      className={cn(
        'absolute inset-0 flex flex-col',
        direction === 'forward' && 'animate-panel-slide-left',
        direction === 'backward' && 'animate-panel-slide-right',
        className
      )}
    >
      {children}
    </div>
  )
}
