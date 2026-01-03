import { useCallback, useRef, type ReactNode, type PointerEvent } from 'react'
import { tv } from 'tailwind-variants'
import { Toast as ToastPrimitive, type ToastData, type ToastOptions } from '@ui/primitive/toast'
import { cn } from '@ui/lib/cn'

const toastVariants = tv({
  base: [
    'relative flex items-center gap-3 w-full max-w-sm px-4 py-3',
    'bg-bg-secondary border border-border-subtle rounded-xl',
    'shadow-lg text-sm text-text-primary',
    'touch-pan-x select-none',
    'transition-all duration-200 ease-out',
    'data-[removing]:animate-toast-out',
    'animate-toast-in',
  ],
  variants: {
    variant: {
      default: '',
      success: 'border-success/30 bg-success/10',
      error: 'border-error/30 bg-error/10',
      warning: 'border-warning/30 bg-warning/10',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const iconVariants = tv({
  base: 'shrink-0 size-5',
  variants: {
    variant: {
      default: 'text-text-secondary',
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
    },
  },
})

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const variantIcons = {
  default: InfoIcon,
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
}

type ToastItemProps = {
  toast: ToastData
}

const SWIPE_THRESHOLD = 80

function ToastItem({ toast }: ToastItemProps) {
  const startX = useRef(0)
  const currentX = useRef(0)
  const elementRef = useRef<HTMLDivElement>(null)

  const Icon = variantIcons[toast.variant]

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (toast.removing) return
      startX.current = e.clientX
      currentX.current = e.clientX
      ToastPrimitive.Manager.pause(toast.id)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [toast.id, toast.removing]
  )

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (startX.current === 0) return
    currentX.current = e.clientX
    const delta = currentX.current - startX.current
    if (elementRef.current) {
      elementRef.current.style.transform = `translateX(${delta}px)`
      elementRef.current.style.opacity = `${1 - Math.abs(delta) / (SWIPE_THRESHOLD * 2)}`
    }
  }, [])

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (startX.current === 0) return
      const delta = currentX.current - startX.current

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (elementRef.current) {
          elementRef.current.style.transform = `translateX(${delta > 0 ? '100%' : '-100%'})`
          elementRef.current.style.opacity = '0'
        }
        ToastPrimitive.dismiss(toast.id)
      } else {
        if (elementRef.current) {
          elementRef.current.style.transform = ''
          elementRef.current.style.opacity = ''
        }
        ToastPrimitive.Manager.resume(toast.id)
      }

      startX.current = 0
      currentX.current = 0
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    },
    [toast.id]
  )

  const handlePointerEnter = useCallback(() => {
    if (!toast.removing) {
      ToastPrimitive.Manager.pause(toast.id)
    }
  }, [toast.id, toast.removing])

  const handlePointerLeave = useCallback(() => {
    if (!toast.removing && startX.current === 0) {
      ToastPrimitive.Manager.resume(toast.id)
    }
  }, [toast.id, toast.removing])

  return (
    <div
      ref={elementRef}
      role="status"
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      className={toastVariants({ variant: toast.variant })}
      data-removing={toast.removing || undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Icon className={iconVariants({ variant: toast.variant })} />
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => ToastPrimitive.dismiss(toast.id)}
        className={cn(
          'shrink-0 size-6 flex items-center justify-center rounded-md',
          'text-text-muted hover:text-text-primary hover:bg-bg-tertiary',
          'transition-colors touch-manipulation'
        )}
        aria-label="Dismiss"
      >
        <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  )
}

export type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toasts = ToastPrimitive.useToasts()

  return (
    <>
      {children}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col-reverse items-center gap-2 p-4',
          'pointer-events-none'
        )}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full flex justify-center">
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </>
  )
}

export const Toast = {
  Provider: ToastProvider,
  show: (options: ToastOptions) => ToastPrimitive.show(options),
  success: (message: string, duration?: number) =>
    ToastPrimitive.show(duration !== undefined ? { message, variant: 'success', duration } : { message, variant: 'success' }),
  error: (message: string, duration?: number) =>
    ToastPrimitive.show(duration !== undefined ? { message, variant: 'error', duration } : { message, variant: 'error' }),
  warning: (message: string, duration?: number) =>
    ToastPrimitive.show(duration !== undefined ? { message, variant: 'warning', duration } : { message, variant: 'warning' }),
  dismiss: (id: string) => ToastPrimitive.dismiss(id),
  clear: () => ToastPrimitive.clear(),
  useToasts: ToastPrimitive.useToasts,
}
