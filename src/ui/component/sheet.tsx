import { forwardRef, type ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { Sheet as SheetPrimitive, useSheetStore, type SheetStore } from '@ui/primitive/sheet'
import { cn } from '@ui/lib/cn'

export type SheetProps = {
  children: ReactNode
  store: SheetStore
}

function Root({ children, store }: SheetProps) {
  return <SheetPrimitive.Root store={store}>{children}</SheetPrimitive.Root>
}

export type SheetTriggerProps = Ariakit.DialogDisclosureProps

const Trigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, ...props }, ref) => {
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
  }
)
Trigger.displayName = 'Sheet.Trigger'

export type SheetContentProps = Ariakit.DialogProps

const Content = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Ariakit.Dialog
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-bg-secondary border-t border-border rounded-t-2xl',
          'shadow-lg max-h-[85vh] overflow-auto',
          'transition-transform duration-200 ease-out',
          'data-[enter]:animate-sheet-up data-[leave]:animate-sheet-down',
          className
        )}
        backdrop={
          <div
            className={cn(
              'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
              'transition-opacity duration-200',
              'data-[enter]:animate-fade-in data-[leave]:animate-fade-out'
            )}
          />
        }
        {...props}
      >
        <div className="mx-auto w-12 h-1.5 bg-bg-tertiary rounded-full mt-3 mb-2" />
        {children}
      </Ariakit.Dialog>
    )
  }
)
Content.displayName = 'Sheet.Content'

export type SheetCloseProps = Ariakit.DialogDismissProps

const Close = forwardRef<HTMLButtonElement, SheetCloseProps>((props, ref) => {
  return <Ariakit.DialogDismiss ref={ref} {...props} />
})
Close.displayName = 'Sheet.Close'

export type SheetHeadingProps = Ariakit.DialogHeadingProps

const Heading = forwardRef<HTMLHeadingElement, SheetHeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <Ariakit.DialogHeading
        ref={ref}
        className={cn('text-lg font-semibold text-text-primary', className)}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Sheet.Heading'

export const Sheet = {
  Root,
  Trigger,
  Content,
  Close,
  Heading,
  useStore: useSheetStore,
}
