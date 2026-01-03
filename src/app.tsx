import { useEffect } from 'react'
import { Game } from '@framework/setup'

export default function App() {
  useEffect(() => {
    Game.start()
    return () => Game.stop()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4">
      <h1 className="text-2xl font-bold">WorldCoaster</h1>
      <p className="text-neutral-400">ECS Engine Running</p>
    </div>
  )
}
