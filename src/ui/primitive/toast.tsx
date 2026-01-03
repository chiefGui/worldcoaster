import { useSyncExternalStore } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export type ToastData = {
  id: string
  message: string
  variant: ToastVariant
  duration: number
  createdAt: number
  paused: boolean
  removing: boolean
}

export type ToastOptions = {
  message: string
  variant?: ToastVariant
  duration?: number
}

type ToastState = {
  toasts: ToastData[]
  listeners: Set<() => void>
}

const state: ToastState = {
  toasts: [],
  listeners: new Set(),
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function notify() {
  for (const listener of state.listeners) {
    listener()
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function startTimer(id: string, duration: number) {
  clearTimer(id)
  timers.set(
    id,
    setTimeout(() => {
      ToastManager.dismiss(id)
    }, duration)
  )
}

function clearTimer(id: string) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

export class ToastManager {
  private static readonly MAX_VISIBLE = 3
  private static readonly REMOVE_DELAY = 200

  static show(options: ToastOptions): string {
    const id = generateId()
    const duration = options.duration ?? 4000
    const toast: ToastData = {
      id,
      message: options.message,
      variant: options.variant ?? 'default',
      duration,
      createdAt: Date.now(),
      paused: false,
      removing: false,
    }

    state.toasts = [toast, ...state.toasts].slice(0, this.MAX_VISIBLE)
    notify()

    startTimer(id, duration)
    return id
  }

  static dismiss(id: string): void {
    const toast = state.toasts.find((t) => t.id === id)
    if (!toast || toast.removing) return

    clearTimer(id)

    state.toasts = state.toasts.map((t) => (t.id === id ? { ...t, removing: true } : t))
    notify()

    setTimeout(() => {
      state.toasts = state.toasts.filter((t) => t.id !== id)
      notify()
    }, this.REMOVE_DELAY)
  }

  static pause(id: string): void {
    clearTimer(id)
    state.toasts = state.toasts.map((t) => (t.id === id ? { ...t, paused: true } : t))
    notify()
  }

  static resume(id: string): void {
    const toast = state.toasts.find((t) => t.id === id)
    if (!toast || toast.removing) return

    const elapsed = Date.now() - toast.createdAt
    const remaining = Math.max(toast.duration - elapsed, 1000)

    state.toasts = state.toasts.map((t) => (t.id === id ? { ...t, paused: false } : t))
    notify()

    startTimer(id, remaining)
  }

  static clear(): void {
    for (const id of timers.keys()) {
      clearTimer(id)
    }
    state.toasts = []
    notify()
  }

  static subscribe(listener: () => void): () => void {
    state.listeners.add(listener)
    return () => state.listeners.delete(listener)
  }

  static getSnapshot(): ToastData[] {
    return state.toasts
  }
}

export function useToasts(): ToastData[] {
  return useSyncExternalStore(ToastManager.subscribe, ToastManager.getSnapshot, ToastManager.getSnapshot)
}

export const Toast = {
  Manager: ToastManager,
  useToasts,
  show: (options: ToastOptions) => ToastManager.show(options),
  dismiss: (id: string) => ToastManager.dismiss(id),
  clear: () => ToastManager.clear(),
}
