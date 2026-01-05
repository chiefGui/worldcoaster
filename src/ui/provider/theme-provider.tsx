import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeId = 'gray' | 'slate' | 'classy' | 'lollipop' | 'forest'

export type ThemeColors = {
  bg: string
  accent: string
  text: string
}

export type ThemeDefinition = {
  id: ThemeId
  name: string
  colors: ThemeColors
}

export const themes: ThemeDefinition[] = [
  {
    id: 'gray',
    name: 'Gray',
    colors: { bg: 'oklch(0.145 0 0)', accent: 'oklch(0.623 0.214 259)', text: 'oklch(0.985 0 0)' }
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: { bg: 'oklch(0.13 0.02 265)', accent: 'oklch(0.623 0.214 259)', text: 'oklch(0.985 0.005 265)' }
  },
  {
    id: 'classy',
    name: 'Classy',
    colors: { bg: 'oklch(0.15 0.01 60)', accent: 'oklch(0.7 0.18 70)', text: 'oklch(0.96 0.04 85)' }
  },
  {
    id: 'lollipop',
    name: 'Lollipop',
    colors: { bg: 'oklch(0.13 0.04 310)', accent: 'oklch(0.75 0.2 320)', text: 'oklch(0.97 0.015 310)' }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: { bg: 'oklch(0.14 0.03 145)', accent: 'oklch(0.723 0.191 149)', text: 'oklch(0.97 0.03 155)' }
  },
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
    return (stored as ThemeId) || 'gray'
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
