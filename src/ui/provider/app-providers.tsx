import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'
import { Toast } from '@ui/component/toast'
import { ActionBar } from '@ui/component/action-bar'
import { PreferencesProvider } from '@ui/provider/preferences-provider'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PreferencesProvider>
      <Backdrop.Provider>
        <Toast.Provider>
          <ActionBar.Provider>{children}</ActionBar.Provider>
        </Toast.Provider>
      </Backdrop.Provider>
    </PreferencesProvider>
  )
}
