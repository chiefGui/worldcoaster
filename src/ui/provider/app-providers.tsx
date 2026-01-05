import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'
import { Toast } from '@ui/component/toast'
import { ThemeProvider } from '@ui/provider/theme-provider'
import { FontProvider } from '@ui/provider/font-provider'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <FontProvider>
        <Backdrop.Provider>
          <Toast.Provider>{children}</Toast.Provider>
        </Backdrop.Provider>
      </FontProvider>
    </ThemeProvider>
  )
}
