import type { ReactNode } from 'react'
import { Sheet as SheetPrimitive } from '@ui/primitive/sheet'
import { cn } from '@ui/lib/cn'

export type SheetProps = {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Root({ children, ...props }: SheetProps) {
  return <SheetPrimitive.Root {...props}>{children}</SheetPrimitive.Root>
}

export type SheetTriggerProps = {
  children: ReactNode
  className?: string
  asChild?: boolean
}

function Trigger({ children, className, asChild }: SheetTriggerProps) {
  if (asChild) {
    return <SheetPrimitive.Trigger asChild>{children}</SheetPrimitive.Trigger>
  }

  return (
    <SheetPrimitive.Trigger>
      {({ open }) => (
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            className
          )}
          onClick={() => {}}
          aria-expanded={open}
        >
          {children}
        </button>
      )}
    </SheetPrimitive.Trigger>
  )
}

function Overlay() {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
        'animate-in fade-in duration-200'
      )}
    />
  )
}

export type SheetContentProps = {
  children: ReactNode
  className?: string
}

function Content({ children, className }: SheetContentProps) {
  return (
    <>
      <Overlay />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-bg-secondary border-t border-border rounded-t-2xl',
          'shadow-lg max-h-[85vh] overflow-auto',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
      >
        <div className="mx-auto w-12 h-1.5 bg-bg-tertiary rounded-full mt-3 mb-2" />
        {children}
      </SheetPrimitive.Content>
    </>
  )
}

export type SheetCloseProps = {
  children: ReactNode
  className?: string
}

function Close({ children, className }: SheetCloseProps) {
  return (
    <SheetPrimitive.Close>
      <span className={className}>{children}</span>
    </SheetPrimitive.Close>
  )
}

export const Sheet = {
  Root,
  Trigger,
  Content,
  Close,
  useSheet: SheetPrimitive.useSheet,
}
