import { useState, type FormEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { AppLayout } from '../layouts/AppLayout'

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = displayName.trim()
    if (!trimmed) {
      setError('Display name cannot be empty.')
      setSaved(false)
      return
    }

    updateProfile(trimmed)
    setError(null)
    setSaved(true)
  }

  return (
    <AppLayout title="Profile" backTo={ROUTES.WELCOME} align="top">
      <div className="rounded-lg bg-surface p-6 shadow-md">
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Manage how your name appears on the welcome screen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" name="email" value={user.email} disabled />

          <Input
            label="Display name"
            name="displayName"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value)
              setSaved(false)
            }}
            maxLength={50}
            error={error ?? undefined}
          />

          {saved ? <Alert variant="success">Profile updated successfully.</Alert> : null}

          <Button type="submit" fullWidth>
            Save profile
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}
