import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type FontId = 'geist' | 'inter' | 'space-grotesk' | 'outfit'

export type FontDefinition = {
  id: FontId
  name: string
  preview: string
}

export const fonts: FontDefinition[] = [
  { id: 'geist', name: 'Geist', preview: 'Geist Variable' },
  { id: 'inter', name: 'Inter', preview: 'Inter Variable' },
  { id: 'space-grotesk', name: 'Space Grotesk', preview: 'Space Grotesk Variable' },
  { id: 'outfit', name: 'Outfit', preview: 'Outfit Variable' },
]

type FontContextValue = {
  font: FontId
  setFont: (font: FontId) => void
  fonts: FontDefinition[]
}

const FontContext = createContext<FontContextValue | null>(null)

const STORAGE_KEY = 'worldcoaster-font'

export function useFont() {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within FontProvider')
  }
  return context
}

type FontProviderProps = {
  children: ReactNode
}

export function FontProvider({ children }: FontProviderProps) {
  const [font, setFontState] = useState<FontId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored as FontId) || 'geist'
  })

  const setFont = useCallback((newFont: FontId) => {
    setFontState(newFont)
    localStorage.setItem(STORAGE_KEY, newFont)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-font', font)
  }, [font])

  return (
    <FontContext.Provider value={{ font, setFont, fonts }}>
      {children}
    </FontContext.Provider>
  )
}
