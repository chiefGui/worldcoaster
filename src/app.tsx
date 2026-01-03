import { Component, useEffect, type ReactNode } from 'react'
import { Game } from '@framework/setup'
import { AppProviders } from '@ui/provider/app-providers'
import { GameLayout } from '@ui/layout/game-layout'

type ErrorBoundaryState = { error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h1>Error:</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  useEffect(() => {
    void Game.start()
    return () => Game.stop()
  }, [])

  return (
    <ErrorBoundary>
      <AppProviders>
        <GameLayout />
      </AppProviders>
    </ErrorBoundary>
  )
}
