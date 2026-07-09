import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { APP_INFO } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../hooks/useAuth'
import { clearAllAppData } from '../utils/clearAppData'
import { AppLayout } from '../layouts/AppLayout'

export function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { settings, toggleTheme } = useSettings()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  async function handleClearData() {
    setIsClearing(true)
    try {
      clearAllAppData()
      await logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsClearing(false)
      setShowClearConfirm(false)
    }
  }

  return (
    <AppLayout title="Settings" backTo={ROUTES.WELCOME} align="top">
      <div className="space-y-4">
        <section className="rounded-lg bg-surface p-4 shadow-md">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Appearance</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Current theme: {settings.theme === 'dark' ? 'Dark' : 'Light'}
          </p>
          <div className="mt-4">
            <Button variant="outline" fullWidth onClick={toggleTheme}>
              Switch to {settings.theme === 'dark' ? 'light' : 'dark'} mode
            </Button>
          </div>
        </section>

        <section className="rounded-lg bg-surface p-4 shadow-md">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">About</h2>
          <dl className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between gap-4">
              <dt>App</dt>
              <dd className="text-gray-900 dark:text-gray-100">{APP_INFO.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Version</dt>
              <dd className="text-gray-900 dark:text-gray-100">{APP_INFO.version}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Contact</dt>
              <dd>
                <a
                  href={`mailto:${APP_INFO.contactEmail}`}
                  className="text-primary hover:underline"
                >
                  {APP_INFO.contactEmail}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <a
              href={APP_INFO.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Privacy policy
            </a>
          </div>
        </section>

        <section className="rounded-lg bg-surface p-4 shadow-md">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Data</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Notes and settings are stored locally on this device.
          </p>

          <div className="mt-4">
            <Button variant="outline" fullWidth onClick={() => setShowClearConfirm(true)}>
              Clear all app data
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all app data?"
        message="This will delete your notes, profile session, and settings from this device. You will be signed out."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear data'}
        destructive
        confirmDisabled={isClearing}
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </AppLayout>
  )
}
