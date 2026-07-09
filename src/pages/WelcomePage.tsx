import { LogoutButton } from '../components/auth/LogoutButton'
import { DashboardCard } from '../components/dashboard/DashboardCard'
import { Alert } from '../components/ui/Alert'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useNotes } from '../hooks/useNotes'
import { AppLayout } from '../layouts/AppLayout'
import logo from '../assets/logo.svg'

export function WelcomePage() {
  const { user } = useAuth()
  const { notes } = useNotes()

  if (!user) {
    return null
  }

  return (
    <AppLayout align="top">
      <div className="space-y-6">
        <div className="rounded-lg bg-surface p-8 text-center shadow-md">
          <img
            src={logo}
            alt="Welcome App logo"
            className="mx-auto mb-6 h-20 w-20"
          />

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome, {user.displayName}
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{user.email}</p>

          <div className="mt-4">
            <Alert variant="success">You are signed in to your personal space.</Alert>
          </div>
        </div>

        <section aria-label="App features" className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Your space
          </h2>

          <DashboardCard
            to={ROUTES.NOTES}
            title="My Notes"
            description={`${notes.length} private note${notes.length === 1 ? '' : 's'} saved on this device`}
            icon="📝"
          />

          <DashboardCard
            to={ROUTES.PROFILE}
            title="Profile"
            description="View and update your display name"
            icon="👤"
          />

          <DashboardCard
            to={ROUTES.SETTINGS}
            title="Settings"
            description="Theme, privacy policy, and app data"
            icon="⚙️"
          />
        </section>

        <LogoutButton />
      </div>
    </AppLayout>
  )
}
