import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'
import { Toast } from '@ui/component/toast'
import { PreferencesProvider } from '@ui/provider/preferences-provider'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PreferencesProvider>
      <Backdrop.Provider>
        <Toast.Provider>{children}</Toast.Provider>
      </Backdrop.Provider>
    </PreferencesProvider>
  )
}
