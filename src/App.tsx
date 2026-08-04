import { HashRouter } from 'react-router-dom'
import { CompanionLayer } from './components/companion/CompanionLayer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { AppRouter } from './routes/AppRouter'
import { AuthBootstrap } from './routes/AuthBootstrap'
import './styles/companion.css'

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <HashRouter>
            <AuthBootstrap>
              <AppRouter />
              <CompanionLayer />
            </AuthBootstrap>
          </HashRouter>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}

export default App
