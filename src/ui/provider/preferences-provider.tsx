import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

export type ThemeId = 'gray' | 'slate' | 'classy' | 'lollipop' | 'forest'
export type FontId = 'geist' | 'inter' | 'space-grotesk' | 'outfit'

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

export type FontDefinition = {
  id: FontId
  name: string
  preview: string
}

export type UserPreferences = {
  theme: ThemeId
  font: FontId
}

// ============================================================================
// Definitions
// ============================================================================

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

export const fonts: FontDefinition[] = [
  { id: 'geist', name: 'Geist', preview: 'Geist Variable' },
  { id: 'inter', name: 'Inter', preview: 'Inter Variable' },
  { id: 'space-grotesk', name: 'Space Grotesk', preview: 'Space Grotesk Variable' },
  { id: 'outfit', name: 'Outfit', preview: 'Outfit Variable' },
]

// ============================================================================
// Defaults & Storage
// ============================================================================

const STORAGE_KEY = 'worldcoaster-preferences'

const defaultPreferences: UserPreferences = {
  theme: 'gray',
  font: 'geist',
}

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultPreferences, ...parsed }
    }
  } catch {
    // Invalid JSON, use defaults
  }
  return defaultPreferences
}

function savePreferences(preferences: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

function applyPreferences(preferences: UserPreferences): void {
  document.documentElement.setAttribute('data-theme', preferences.theme)
  document.documentElement.setAttribute('data-font', preferences.font)
}

// ============================================================================
// Context
// ============================================================================

type PreferencesContextValue = {
  preferences: UserPreferences
  setTheme: (theme: ThemeId) => void
  setFont: (font: FontId) => void
  themes: ThemeDefinition[]
  fonts: FontDefinition[]
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}

// ============================================================================
// Provider
// ============================================================================

type PreferencesProviderProps = {
  children: ReactNode
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences)

  const setTheme = useCallback((theme: ThemeId) => {
    setPreferences(prev => {
      const next = { ...prev, theme }
      savePreferences(next)
      return next
    })
  }, [])

  const setFont = useCallback((font: FontId) => {
    setPreferences(prev => {
      const next = { ...prev, font }
      savePreferences(next)
      return next
    })
  }, [])

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences])

  return (
    <PreferencesContext.Provider value={{ preferences, setTheme, setFont, themes, fonts }}>
      {children}
    </PreferencesContext.Provider>
  )
}
