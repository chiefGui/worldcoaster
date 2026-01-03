import { forwardRef, type ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { Popover as PopoverPrimitive, usePopoverStore, type PopoverStore } from '@ui/primitive/popover'
import { cn } from '@ui/lib/cn'

export type PopoverProps = {
  children: ReactNode
  store: PopoverStore
}

function Root({ children, store }: PopoverProps) {
  return <PopoverPrimitive.Root store={store}>{children}</PopoverPrimitive.Root>
}

export type PopoverTriggerProps = Ariakit.PopoverDisclosureProps

const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.PopoverDisclosure
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
Trigger.displayName = 'Popover.Trigger'

export type PopoverAnchorProps = Ariakit.PopoverAnchorProps

const Anchor = forwardRef<HTMLDivElement, PopoverAnchorProps>((props, ref) => {
  return <Ariakit.PopoverAnchor ref={ref} {...props} />
})
Anchor.displayName = 'Popover.Anchor'

export type PopoverContentProps = Ariakit.PopoverProps & {
  showArrow?: boolean
}

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, showArrow = true, ...props }, ref) => {
    return (
      <Ariakit.Popover
        ref={ref}
        gutter={8}
        className={cn(
          'z-50 bg-bg-secondary border border-border rounded-xl',
          'shadow-lg p-3',
          'origin-[var(--popover-transform-origin)]',
          'opacity-0 scale-95 transition-all duration-150 ease-out',
          'data-[enter]:opacity-100 data-[enter]:scale-100',
          'data-[leave]:opacity-0 data-[leave]:scale-95',
          className
        )}
        {...props}
      >
        {showArrow && <Arrow />}
        {children}
      </Ariakit.Popover>
    )
  }
)
Content.displayName = 'Popover.Content'

export type PopoverArrowProps = Ariakit.PopoverArrowProps

const Arrow = forwardRef<HTMLDivElement, PopoverArrowProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.PopoverArrow
      ref={ref}
      size={16}
      className={cn('fill-bg-secondary [&>path:first-child]:stroke-border', className)}
      {...props}
    />
  )
})
Arrow.displayName = 'Popover.Arrow'

export type PopoverHeadingProps = Ariakit.PopoverHeadingProps

const Heading = forwardRef<HTMLHeadingElement, PopoverHeadingProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.PopoverHeading
      ref={ref}
      className={cn('text-sm font-semibold text-text-primary mb-1', className)}
      {...props}
    />
  )
})
Heading.displayName = 'Popover.Heading'

export type PopoverDescriptionProps = Ariakit.PopoverDescriptionProps

const Description = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <Ariakit.PopoverDescription
        ref={ref}
        className={cn('text-sm text-text-secondary', className)}
        {...props}
      />
    )
  }
)
Description.displayName = 'Popover.Description'

export type PopoverDismissProps = Ariakit.PopoverDismissProps

const Dismiss = forwardRef<HTMLButtonElement, PopoverDismissProps>(({ className, ...props }, ref) => {
  return (
    <Ariakit.PopoverDismiss
      ref={ref}
      className={cn(
        'absolute top-2 right-2 size-6 flex items-center justify-center rounded-md',
        'text-text-muted hover:text-text-primary hover:bg-bg-tertiary',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
})
Dismiss.displayName = 'Popover.Dismiss'

export const Popover = {
  Root,
  Trigger,
  Anchor,
  Content,
  Arrow,
  Heading,
  Description,
  Dismiss,
  useStore: usePopoverStore,
}
