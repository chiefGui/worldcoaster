import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from 'react'

type BackdropState = {
  count: number
  listeners: Set<() => void>
}

const state: BackdropState = {
  count: 0,
  listeners: new Set(),
}

function notify() {
  for (const listener of state.listeners) {
    listener()
  }
}

export class BackdropManager {
  static show(): void {
    state.count++
    notify()
  }

  static hide(): void {
    state.count = Math.max(0, state.count - 1)
    notify()
  }

  static isVisible(): boolean {
    return state.count > 0
  }

  static subscribe(listener: () => void): () => void {
    state.listeners.add(listener)
    return () => state.listeners.delete(listener)
  }

  static getSnapshot(): number {
    return state.count
  }
}

export function useBackdrop() {
  const count = useSyncExternalStore(
    BackdropManager.subscribe,
    BackdropManager.getSnapshot,
    BackdropManager.getSnapshot
  )
  return count > 0
}

export function useBackdropControls() {
  const show = useCallback(() => BackdropManager.show(), [])
  const hide = useCallback(() => BackdropManager.hide(), [])
  return { show, hide }
}

type BackdropContextValue = {
  show: () => void
  hide: () => void
}

const BackdropContext = createContext<BackdropContextValue | null>(null)

export function useBackdropContext() {
  const context = useContext(BackdropContext)
  if (!context) {
    throw new Error('useBackdropContext must be used within BackdropProvider')
  }
  return context
}

export type BackdropProviderProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function BackdropProvider({ children, className, onClick }: BackdropProviderProps) {
  const visible = useBackdrop()
  const controls = useBackdropControls()

  return (
    <BackdropContext.Provider value={controls}>
      {children}
      {visible && (
        <div
          className={className}
          onClick={onClick}
          aria-hidden="true"
          data-backdrop
        />
      )}
    </BackdropContext.Provider>
  )
}

export const Backdrop = {
  Provider: BackdropProvider,
  Manager: BackdropManager,
  useBackdrop,
  useControls: useBackdropControls,
  useContext: useBackdropContext,
}
