import { HashRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { AppRouter } from './routes/AppRouter'
import { AuthBootstrap } from './routes/AuthBootstrap'

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <HashRouter>
            <AuthBootstrap>
              <AppRouter />
            </AuthBootstrap>
          </HashRouter>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}

export default App
