import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'
import { Toast } from '@ui/component/toast'
import { ActionBar } from '@ui/component/action-bar'
import { ThemeProvider } from '@ui/provider/theme-provider'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <Backdrop.Provider>
        <Toast.Provider>
          <ActionBar.Provider>{children}</ActionBar.Provider>
        </Toast.Provider>
      </Backdrop.Provider>
    </ThemeProvider>
  )
}
