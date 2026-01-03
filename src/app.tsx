import { useEffect } from 'react'
import { Game } from '@framework/setup'
import { GameLayout } from '@ui/layout/game-layout'

export default function App() {
  useEffect(() => {
    Game.start()
    return () => Game.stop()
  }, [])

  return <GameLayout />
}
