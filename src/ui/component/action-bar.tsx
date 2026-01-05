import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@ui/lib/cn'

type ActionBarContent = {
  icon?: ReactNode
  title: string
  subtitle?: string
  onDismiss?: () => void
} | null

type ActionBarContextValue = {
  content: ActionBarContent
  show: (content: NonNullable<ActionBarContent>) => void
  hide: () => void
}

const ActionBarContext = createContext<ActionBarContextValue | null>(null)

export function useActionBar() {
  const context = useContext(ActionBarContext)
  if (!context) {
    throw new Error('useActionBar must be used within ActionBar.Provider')
  }
  return context
}

type ProviderProps = {
  children: ReactNode
}

function Provider({ children }: ProviderProps) {
  const [content, setContent] = useState<ActionBarContent>(null)

  const show = useCallback((newContent: NonNullable<ActionBarContent>) => {
    setContent(newContent)
  }, [])

  const hide = useCallback(() => {
    setContent((current) => {
      current?.onDismiss?.()
      return null
    })
  }, [])

  return (
    <ActionBarContext.Provider value={{ content, show, hide }}>
      {children}
      {content && (
        <div
          className={cn(
            'fixed bottom-20 left-4 right-4 z-50',
            'bg-success text-success-foreground rounded-xl shadow-lg',
            'flex items-center gap-3 p-3',
            'animate-in slide-in-from-bottom-4 fade-in duration-200'
          )}
        >
          {content.icon && (
            <div className="flex-shrink-0">{content.icon}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{content.title}</div>
            {content.subtitle && (
              <div className="text-sm opacity-80">{content.subtitle}</div>
            )}
          </div>
          <button
            onClick={hide}
            className={cn(
              'p-2 rounded-lg flex-shrink-0',
              'bg-success-foreground/20 hover:bg-success-foreground/30',
              'transition-colors'
            )}
            aria-label="Dismiss"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </ActionBarContext.Provider>
  )
}

export const ActionBar = {
  Provider,
  useActionBar,
}
