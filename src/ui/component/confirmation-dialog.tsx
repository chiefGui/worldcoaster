import { forwardRef, type ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import {
  ConfirmationDialog as ConfirmationDialogPrimitive,
  useConfirmationDialogStore,
  type ConfirmationDialogStore,
} from '@ui/primitive/confirmation-dialog'
import { cn } from '@ui/lib/cn'

export type ConfirmationDialogProps = {
  children: ReactNode
  store: ConfirmationDialogStore
}

function Root({ children, store }: ConfirmationDialogProps) {
  return <ConfirmationDialogPrimitive.Root store={store}>{children}</ConfirmationDialogPrimitive.Root>
}

export type ConfirmationDialogTriggerProps = Ariakit.DialogDisclosureProps

const Trigger = forwardRef<HTMLButtonElement, ConfirmationDialogTriggerProps>(
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
Trigger.displayName = 'ConfirmationDialog.Trigger'

export type ConfirmationDialogContentProps = Ariakit.DialogProps & {
  variant?: 'default' | 'danger'
}

const Content = forwardRef<HTMLDivElement, ConfirmationDialogContentProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <Ariakit.Dialog
        ref={ref}
        backdrop={
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200" />
        }
        className={cn(
          'fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100%-2rem)] max-w-sm',
          'bg-bg-secondary border border-border rounded-2xl',
          'shadow-xl p-6',
          'opacity-0 scale-95 transition-all duration-200 ease-out',
          'data-[enter]:opacity-100 data-[enter]:scale-100',
          variant === 'danger' && 'border-error/30',
          className
        )}
        {...props}
      >
        {children}
      </Ariakit.Dialog>
    )
  }
)
Content.displayName = 'ConfirmationDialog.Content'

export type ConfirmationDialogHeadingProps = Ariakit.DialogHeadingProps

const Heading = forwardRef<HTMLHeadingElement, ConfirmationDialogHeadingProps>(
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
Heading.displayName = 'ConfirmationDialog.Heading'

export type ConfirmationDialogDescriptionProps = Ariakit.DialogDescriptionProps

const Description = forwardRef<HTMLParagraphElement, ConfirmationDialogDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <Ariakit.DialogDescription
        ref={ref}
        className={cn('mt-2 text-sm text-text-secondary', className)}
        {...props}
      />
    )
  }
)
Description.displayName = 'ConfirmationDialog.Description'

export type ConfirmationDialogActionsProps = {
  children: ReactNode
  className?: string
}

function Actions({ children, className }: ConfirmationDialogActionsProps) {
  return (
    <div className={cn('mt-6 flex gap-3 justify-end', className)}>
      {children}
    </div>
  )
}

export type ConfirmationDialogCancelProps = Ariakit.DialogDismissProps

const Cancel = forwardRef<HTMLButtonElement, ConfirmationDialogCancelProps>(
  ({ className, children = 'Cancel', ...props }, ref) => {
    return (
      <Ariakit.DialogDismiss
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium',
          'bg-bg-tertiary text-text-primary',
          'hover:bg-bg-tertiary/80 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          className
        )}
        {...props}
      >
        {children}
      </Ariakit.DialogDismiss>
    )
  }
)
Cancel.displayName = 'ConfirmationDialog.Cancel'

export type ConfirmationDialogConfirmProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'danger'
}

const Confirm = forwardRef<HTMLButtonElement, ConfirmationDialogConfirmProps>(
  ({ className, variant = 'default', children = 'Confirm', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium',
          'transition-colors',
          'focus:outline-none focus-visible:ring-2',
          variant === 'default' && [
            'bg-accent text-white',
            'hover:bg-accent/90',
            'focus-visible:ring-accent',
          ],
          variant === 'danger' && [
            'bg-error text-white',
            'hover:bg-error/90',
            'focus-visible:ring-error',
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Confirm.displayName = 'ConfirmationDialog.Confirm'

export const ConfirmationDialog = {
  Root,
  Trigger,
  Content,
  Heading,
  Description,
  Actions,
  Cancel,
  Confirm,
  useStore: useConfirmationDialogStore,
}
