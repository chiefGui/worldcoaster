import { forwardRef, useLayoutEffect, type ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import {
  Drawer as DrawerPrimitive,
  useDrawerStore,
  type DrawerStore,
  type DrawerSide,
} from '@ui/primitive/drawer'
import { BackdropManager } from '@ui/primitive/backdrop'
import { cn } from '@ui/lib/cn'

export type DrawerProps = {
  children: ReactNode
  store: DrawerStore
}

function Root({ children, store }: DrawerProps) {
  const open = Ariakit.useStoreState(store, 'open')

  useLayoutEffect(() => {
    if (open) {
      BackdropManager.show()
      return () => BackdropManager.hide()
    }
  }, [open])

  return <DrawerPrimitive.Root store={store}>{children}</DrawerPrimitive.Root>
}

export type DrawerTriggerProps = Ariakit.DialogDisclosureProps

const Trigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.DialogDisclosure
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
      {...props}
    />
  )
})
Trigger.displayName = 'Drawer.Trigger'

export type DrawerContentProps = Ariakit.DialogProps & {
  side?: DrawerSide
}

const Content = forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, side = 'left', ...props }, ref) => {
    return (
      <Ariakit.Dialog
        ref={ref}
        data-side={side}
        className={cn(
          'fixed inset-y-0 z-50 w-[90%] max-w-xs',
          'bg-bg-secondary border-border',
          'shadow-lg overflow-hidden',
          'transition-transform duration-200 ease-out',
          // Left side
          'data-[side=left]:left-0 data-[side=left]:border-r',
          'data-[side=left]:-translate-x-full',
          'data-[side=left]:data-[enter]:translate-x-0',
          // Right side
          'data-[side=right]:right-0 data-[side=right]:border-l',
          'data-[side=right]:translate-x-full',
          'data-[side=right]:data-[enter]:translate-x-0',
          className
        )}
        backdrop={false}
        {...props}
      >
        {children}
      </Ariakit.Dialog>
    )
  }
)
Content.displayName = 'Drawer.Content'

export type DrawerCloseProps = Ariakit.DialogDismissProps

const Close = forwardRef<HTMLButtonElement, DrawerCloseProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.DialogDismiss
      ref={ref}
      className={cn(
        'size-8 flex items-center justify-center rounded-lg',
        'text-text-muted hover:text-text-primary hover:bg-bg-tertiary',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
})
Close.displayName = 'Drawer.Close'

export type DrawerHeadingProps = Ariakit.DialogHeadingProps

const Heading = forwardRef<HTMLHeadingElement, DrawerHeadingProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.DialogHeading
      ref={ref}
      className={cn('text-lg font-semibold text-text-primary', className)}
      {...props}
    />
  )
})
Heading.displayName = 'Drawer.Heading'

export const Drawer = {
  Root,
  Trigger,
  Content,
  Close,
  Heading,
  useStore: useDrawerStore,
}
