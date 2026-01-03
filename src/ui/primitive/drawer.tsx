import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import * as Ariakit from '@ariakit/react'

export type DrawerStore = Ariakit.DialogStore

export type DrawerStoreProps = Ariakit.DialogStoreProps & {
  defaultOpen?: boolean
}

export function useDrawerStore(props?: DrawerStoreProps): DrawerStore {
  return Ariakit.useDialogStore(props)
}

export type DrawerSide = 'left' | 'right'

export type DrawerRootProps = {
  children: ReactNode
  store: DrawerStore
}

function Root({ children, store }: DrawerRootProps) {
  return <Ariakit.DialogProvider store={store}>{children}</Ariakit.DialogProvider>
}

export type DrawerTriggerProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDisclosure>

const Trigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>((props, ref) => {
  return <Ariakit.DialogDisclosure ref={ref} {...props} />
})
Trigger.displayName = 'Drawer.Trigger'

export type DrawerContentProps = ComponentPropsWithoutRef<typeof Ariakit.Dialog> & {
  children: ReactNode
  side?: DrawerSide
}

const Content = forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, side = 'left', ...props }, ref) => {
    return (
      <Ariakit.Dialog ref={ref} data-side={side} {...props}>
        {children}
      </Ariakit.Dialog>
    )
  }
)
Content.displayName = 'Drawer.Content'

export type DrawerCloseProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDismiss>

const Close = forwardRef<HTMLButtonElement, DrawerCloseProps>((props, ref) => {
  return <Ariakit.DialogDismiss ref={ref} {...props} />
})
Close.displayName = 'Drawer.Close'

export type DrawerHeadingProps = ComponentPropsWithoutRef<typeof Ariakit.DialogHeading>

const Heading = forwardRef<HTMLHeadingElement, DrawerHeadingProps>((props, ref) => {
  return <Ariakit.DialogHeading ref={ref} {...props} />
})
Heading.displayName = 'Drawer.Heading'

export type DrawerDescriptionProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDescription>

const Description = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>((props, ref) => {
  return <Ariakit.DialogDescription ref={ref} {...props} />
})
Description.displayName = 'Drawer.Description'

export const Drawer = {
  Root,
  Trigger,
  Content,
  Close,
  Heading,
  Description,
  useStore: useDrawerStore,
}
