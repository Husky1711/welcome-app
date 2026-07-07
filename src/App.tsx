import { HashRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { AppRouter } from './routes/AppRouter'
import { AuthBootstrap } from './routes/AuthBootstrap'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <AuthBootstrap>
            <AppRouter />
          </AuthBootstrap>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
