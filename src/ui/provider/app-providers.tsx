import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'
import { Toast } from '@ui/component/toast'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Backdrop.Provider>
      <Toast.Provider>{children}</Toast.Provider>
    </Backdrop.Provider>
  )
}
