import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import * as Ariakit from '@ariakit/react'

export type SheetStore = Ariakit.DialogStore

export function useSheetStore(props?: Ariakit.DialogStoreProps): SheetStore {
  return Ariakit.useDialogStore(props)
}

export type SheetRootProps = {
  children: ReactNode
  store: SheetStore
}

function Root({ children, store }: SheetRootProps) {
  return <Ariakit.DialogProvider store={store}>{children}</Ariakit.DialogProvider>
}

export type SheetTriggerProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDisclosure>

const Trigger = forwardRef<HTMLButtonElement, SheetTriggerProps>((props, ref) => {
  return <Ariakit.DialogDisclosure ref={ref} {...props} />
})
Trigger.displayName = 'Sheet.Trigger'

export type SheetContentProps = ComponentPropsWithoutRef<typeof Ariakit.Dialog> & {
  children: ReactNode
}

const Content = forwardRef<HTMLDivElement, SheetContentProps>(({ children, ...props }, ref) => {
  return (
    <Ariakit.Dialog ref={ref} backdrop={<Backdrop />} {...props}>
      {children}
    </Ariakit.Dialog>
  )
})
Content.displayName = 'Sheet.Content'

export type SheetBackdropProps = ComponentPropsWithoutRef<'div'>

const Backdrop = forwardRef<HTMLDivElement, SheetBackdropProps>((props, ref) => {
  return <div ref={ref} {...props} />
})
Backdrop.displayName = 'Sheet.Backdrop'

export type SheetCloseProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDismiss>

const Close = forwardRef<HTMLButtonElement, SheetCloseProps>((props, ref) => {
  return <Ariakit.DialogDismiss ref={ref} {...props} />
})
Close.displayName = 'Sheet.Close'

export type SheetHeadingProps = ComponentPropsWithoutRef<typeof Ariakit.DialogHeading>

const Heading = forwardRef<HTMLHeadingElement, SheetHeadingProps>((props, ref) => {
  return <Ariakit.DialogHeading ref={ref} {...props} />
})
Heading.displayName = 'Sheet.Heading'

export type SheetDescriptionProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDescription>

const Description = forwardRef<HTMLParagraphElement, SheetDescriptionProps>((props, ref) => {
  return <Ariakit.DialogDescription ref={ref} {...props} />
})
Description.displayName = 'Sheet.Description'

export const Sheet = {
  Root,
  Trigger,
  Content,
  Backdrop,
  Close,
  Heading,
  Description,
  useStore: useSheetStore,
}
