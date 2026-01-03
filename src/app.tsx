import { useEffect } from 'react'
import { Game } from '@framework/setup'
import { AppProviders } from '@ui/provider/app-providers'
import { GameLayout } from '@ui/layout/game-layout'

export default function App() {
  useEffect(() => {
    Game.start()
    return () => Game.stop()
  }, [])

  return (
    <AppProviders>
      <GameLayout />
    </AppProviders>
  )
}
