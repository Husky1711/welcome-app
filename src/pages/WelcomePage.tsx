import { LogoutButton } from '../components/auth/LogoutButton'
import { Alert } from '../components/ui/Alert'
import { useAuth } from '../hooks/useAuth'
import { AppLayout } from '../layouts/AppLayout'
import logo from '../assets/logo.svg'

export function WelcomePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <AppLayout>
      <div className="rounded-lg bg-surface p-8 text-center shadow-md">
        <img
          src={logo}
          alt="Welcome App logo"
          className="mx-auto mb-6 h-20 w-20"
        />

        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user.displayName}
        </h1>

        <p className="mt-2 text-sm text-gray-600">{user.email}</p>

        <div className="mt-4">
          <Alert variant="success">You are signed in successfully.</Alert>
        </div>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </AppLayout>
  )
}
