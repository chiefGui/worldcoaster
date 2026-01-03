import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type SheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const SheetContext = createContext<SheetContextValue | null>(null)

export function useSheet() {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('useSheet must be used within a Sheet.Root')
  }
  return context
}

export type SheetRootProps = {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Root({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: SheetRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  const toggle = useCallback(() => setOpen(!open), [open, setOpen])

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, setOpen, toggle])

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
}

export type SheetTriggerProps = {
  children: ReactNode | ((props: { open: boolean }) => ReactNode)
  asChild?: boolean
}

function Trigger({ children, asChild }: SheetTriggerProps) {
  const { open, toggle } = useSheet()

  if (typeof children === 'function') {
    return <>{children({ open })}</>
  }

  if (asChild) {
    return <>{children}</>
  }

  return (
    <button type="button" onClick={toggle}>
      {children}
    </button>
  )
}

export type SheetContentProps = {
  children: ReactNode
  className?: string
}

function Content({ children, className }: SheetContentProps) {
  const { open } = useSheet()

  if (!open) return null

  return <div className={className}>{children}</div>
}

export type SheetOverlayProps = {
  className?: string
  closeOnClick?: boolean
}

function Overlay({ className, closeOnClick = true }: SheetOverlayProps) {
  const { open, setOpen } = useSheet()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={className}
      onClick={closeOnClick ? () => setOpen(false) : undefined}
      aria-hidden="true"
    />
  )
}

export type SheetCloseProps = {
  children: ReactNode
  asChild?: boolean
}

function Close({ children, asChild }: SheetCloseProps) {
  const { setOpen } = useSheet()

  if (asChild) {
    return <>{children}</>
  }

  return (
    <button type="button" onClick={() => setOpen(false)}>
      {children}
    </button>
  )
}

export const Sheet = {
  Root,
  Trigger,
  Content,
  Overlay,
  Close,
  useSheet,
}
