import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import * as Ariakit from '@ariakit/react'

export type ConfirmationDialogStore = Ariakit.DialogStore

export type ConfirmationDialogStoreProps = Ariakit.DialogStoreProps & {
  defaultOpen?: boolean
}

export function useConfirmationDialogStore(props?: ConfirmationDialogStoreProps): ConfirmationDialogStore {
  return Ariakit.useDialogStore(props)
}

export type ConfirmationDialogRootProps = {
  children: ReactNode
  store: ConfirmationDialogStore
}

function Root({ children, store }: ConfirmationDialogRootProps) {
  return <Ariakit.DialogProvider store={store}>{children}</Ariakit.DialogProvider>
}

export type ConfirmationDialogTriggerProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDisclosure>

const Trigger = forwardRef<HTMLButtonElement, ConfirmationDialogTriggerProps>((props, ref) => {
  return <Ariakit.DialogDisclosure ref={ref} {...props} />
})
Trigger.displayName = 'ConfirmationDialog.Trigger'

export type ConfirmationDialogContentProps = ComponentPropsWithoutRef<typeof Ariakit.Dialog> & {
  children: ReactNode
}

const Content = forwardRef<HTMLDivElement, ConfirmationDialogContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <Ariakit.Dialog ref={ref} {...props}>
        {children}
      </Ariakit.Dialog>
    )
  }
)
Content.displayName = 'ConfirmationDialog.Content'

export type ConfirmationDialogHeadingProps = ComponentPropsWithoutRef<typeof Ariakit.DialogHeading>

const Heading = forwardRef<HTMLHeadingElement, ConfirmationDialogHeadingProps>((props, ref) => {
  return <Ariakit.DialogHeading ref={ref} {...props} />
})
Heading.displayName = 'ConfirmationDialog.Heading'

export type ConfirmationDialogDescriptionProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDescription>

const Description = forwardRef<HTMLParagraphElement, ConfirmationDialogDescriptionProps>((props, ref) => {
  return <Ariakit.DialogDescription ref={ref} {...props} />
})
Description.displayName = 'ConfirmationDialog.Description'

export type ConfirmationDialogDismissProps = ComponentPropsWithoutRef<typeof Ariakit.DialogDismiss>

const Dismiss = forwardRef<HTMLButtonElement, ConfirmationDialogDismissProps>((props, ref) => {
  return <Ariakit.DialogDismiss ref={ref} {...props} />
})
Dismiss.displayName = 'ConfirmationDialog.Dismiss'

export const ConfirmationDialog = {
  Root,
  Trigger,
  Content,
  Heading,
  Description,
  Dismiss,
  useStore: useConfirmationDialogStore,
}
