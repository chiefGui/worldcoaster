import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import * as Ariakit from '@ariakit/react'

export type PopoverStore = Ariakit.PopoverStore

export function usePopoverStore(props?: Ariakit.PopoverStoreProps): PopoverStore {
  return Ariakit.usePopoverStore(props)
}

export type PopoverRootProps = {
  children: ReactNode
  store: PopoverStore
}

function Root({ children, store }: PopoverRootProps) {
  return <Ariakit.PopoverProvider store={store}>{children}</Ariakit.PopoverProvider>
}

export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverDisclosure>

const Trigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>((props, ref) => {
  return <Ariakit.PopoverDisclosure ref={ref} {...props} />
})
Trigger.displayName = 'Popover.Trigger'

export type PopoverAnchorProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverAnchor>

const Anchor = forwardRef<HTMLDivElement, PopoverAnchorProps>((props, ref) => {
  return <Ariakit.PopoverAnchor ref={ref} {...props} />
})
Anchor.displayName = 'Popover.Anchor'

export type PopoverContentProps = ComponentPropsWithoutRef<typeof Ariakit.Popover> & {
  children: ReactNode
}

const Content = forwardRef<HTMLDivElement, PopoverContentProps>(({ children, ...props }, ref) => {
  return (
    <Ariakit.Popover ref={ref} {...props}>
      {children}
    </Ariakit.Popover>
  )
})
Content.displayName = 'Popover.Content'

export type PopoverArrowProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverArrow>

const Arrow = forwardRef<HTMLDivElement, PopoverArrowProps>((props, ref) => {
  return <Ariakit.PopoverArrow ref={ref} {...props} />
})
Arrow.displayName = 'Popover.Arrow'

export type PopoverHeadingProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverHeading>

const Heading = forwardRef<HTMLHeadingElement, PopoverHeadingProps>((props, ref) => {
  return <Ariakit.PopoverHeading ref={ref} {...props} />
})
Heading.displayName = 'Popover.Heading'

export type PopoverDescriptionProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverDescription>

const Description = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>((props, ref) => {
  return <Ariakit.PopoverDescription ref={ref} {...props} />
})
Description.displayName = 'Popover.Description'

export type PopoverDismissProps = ComponentPropsWithoutRef<typeof Ariakit.PopoverDismiss>

const Dismiss = forwardRef<HTMLButtonElement, PopoverDismissProps>((props, ref) => {
  return <Ariakit.PopoverDismiss ref={ref} {...props} />
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
