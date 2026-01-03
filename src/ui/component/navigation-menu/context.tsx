import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from 'react'

type Direction = 'forward' | 'backward' | 'none'

type NavigationState = {
  current: string
  stack: string[]
  direction: Direction
}

type NavigationContextValue = {
  current: string
  direction: Direction
  canGoBack: boolean
  to: (id: string) => void
  back: () => void
  reset: () => void
  registerPanel: (id: string, parent?: string, title?: string) => void
  getPanelTitle: (id: string) => string | undefined
  getPanelParent: (id: string) => string | undefined
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationMenu.Root')
  }
  return context
}

export type NavigationMenuRootProps = {
  children: ReactNode
  defaultPanel?: string
  onNavigate?: (id: string) => void
}

type PanelMeta = {
  parent?: string
  title?: string
}

export function NavigationMenuRoot({
  children,
  defaultPanel = 'root',
  onNavigate,
}: NavigationMenuRootProps) {
  const [state, setState] = useState<NavigationState>({
    current: defaultPanel,
    stack: [defaultPanel],
    direction: 'none',
  })

  const [panels] = useState<Map<string, PanelMeta>>(() => new Map())

  const registerPanel = useCallback((id: string, parent?: string, title?: string) => {
    const meta: PanelMeta = {}
    if (parent !== undefined) meta.parent = parent
    if (title !== undefined) meta.title = title
    panels.set(id, meta)
  }, [panels])

  const getPanelTitle = useCallback((id: string) => panels.get(id)?.title, [panels])
  const getPanelParent = useCallback((id: string) => panels.get(id)?.parent, [panels])

  const to = useCallback(
    (id: string) => {
      setState((prev) => ({
        current: id,
        stack: [...prev.stack, id],
        direction: 'forward',
      }))
      onNavigate?.(id)
    },
    [onNavigate]
  )

  const back = useCallback(() => {
    setState((prev) => {
      if (prev.stack.length <= 1) return prev
      const newStack = prev.stack.slice(0, -1)
      const newCurrent = newStack[newStack.length - 1] ?? defaultPanel
      onNavigate?.(newCurrent)
      return {
        current: newCurrent,
        stack: newStack,
        direction: 'backward' as const,
      }
    })
  }, [onNavigate, defaultPanel])

  const reset = useCallback(() => {
    setState({
      current: defaultPanel,
      stack: [defaultPanel],
      direction: 'backward',
    })
    onNavigate?.(defaultPanel)
  }, [defaultPanel, onNavigate])

  const value = useMemo<NavigationContextValue>(
    () => ({
      current: state.current,
      direction: state.direction,
      canGoBack: state.stack.length > 1,
      to,
      back,
      reset,
      registerPanel,
      getPanelTitle,
      getPanelParent,
    }),
    [state.current, state.direction, state.stack.length, to, back, reset, registerPanel, getPanelTitle, getPanelParent]
  )

  return (
    <NavigationContext.Provider value={value}>
      <div className="relative h-full overflow-hidden">{children}</div>
    </NavigationContext.Provider>
  )
}
