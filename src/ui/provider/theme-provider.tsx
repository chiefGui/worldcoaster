import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeId = 'dark' | 'light' | 'slate'

export type ThemeDefinition = {
  id: ThemeId
  name: string
}

export const themes: ThemeDefinition[] = [
  { id: 'dark', name: 'Dark' },
  { id: 'light', name: 'Light' },
  { id: 'slate', name: 'Slate' },
]

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  themes: ThemeDefinition[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'worldcoaster-theme'

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Migrate old 'gray' theme to 'dark'
    if (stored === 'gray') return 'dark'
    return (stored as ThemeId) || 'dark'
  })

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}
