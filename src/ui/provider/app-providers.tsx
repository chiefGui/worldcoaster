import type { ReactNode } from 'react'
import { Backdrop } from '@ui/component/backdrop'

export type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <Backdrop.Provider>{children}</Backdrop.Provider>
}
