import { type ReactNode } from 'react'
import { Backdrop as BackdropPrimitive } from '@ui/primitive/backdrop'
import { cn } from '@ui/lib/cn'

export type BackdropProviderProps = {
  children: ReactNode
}

export function BackdropProvider({ children }: BackdropProviderProps) {
  return (
    <BackdropPrimitive.Provider
      className={cn(
        'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm',
        'transition-opacity duration-200',
        'opacity-0 pointer-events-none',
        'data-[visible]:opacity-100 data-[visible]:pointer-events-auto'
      )}
    >
      {children}
    </BackdropPrimitive.Provider>
  )
}

export const Backdrop = {
  Provider: BackdropProvider,
  useControls: BackdropPrimitive.useControls,
  useBackdrop: BackdropPrimitive.useBackdrop,
}
