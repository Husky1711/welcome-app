import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ProfileAvatar } from '../components/profile/ProfileAvatar'
import { ProgressRing } from '../components/habits/ProgressRing'
import { Alert } from '../components/ui/Alert'
import { Input } from '../components/ui/Input'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useNotes } from '../hooks/useNotes'
import { useProfileAvatar } from '../hooks/useProfileAvatar'
import { useTodayTracker } from '../hooks/useTodayTracker'
import { AppLayout } from '../layouts/AppLayout'
import { formatMemberSince } from '../utils/dateUtils'
import { getProgressMessage, getTodayStatusLabel } from '../utils/wellnessCopy'
import '../styles/profile-page.css'

const DISPLAY_NAME_MAX = 50

function getInitials(displayName: string, email: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (email[0] ?? '?').toUpperCase()
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { notes } = useNotes()
  const { habits, progress, streakMap } = useTodayTracker()
  const {
    avatarUrl,
    error: avatarError,
    isUpdating: isAvatarUpdating,
    applyCroppedImage,
    removeAvatar,
    clearError: clearAvatarError,
  } = useProfileAvatar(user?.email)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
  }, [user?.displayName])

  const bestStreak = useMemo(() => {
    if (streakMap.size === 0) return 0
    return Math.max(...streakMap.values())
  }, [streakMap])

  if (!user) {
    return null
  }

  const trimmedName = displayName.trim()
  const previewName = trimmedName || user.displayName || 'Your name'
  const initials = getInitials(trimmedName || user.displayName, user.email)
  const isDirty = trimmedName !== user.displayName
  const progressMessage = getProgressMessage(habits.length, progress.percent, progress.completed)
  const todayLabel = getTodayStatusLabel(
    habits.length,
    progress.completed,
    progress.total,
    progress.percent,
  )
  const ringTotal = habits.length === 0 ? 0 : progress.total
  const ringPercent = habits.length === 0 ? 0 : progress.percent
  const memberSinceLabel = user.memberSince ? formatMemberSince(user.memberSince) : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedName) {
      setError('Display name cannot be empty.')
      setSaved(false)
      return
    }

    if (!isDirty) {
      return
    }

    setIsSaving(true)
    try {
      await updateProfile(trimmedName)
      setError(null)
      setSaved(true)
    } catch (profileError) {
      setSaved(false)
      setError(
        profileError instanceof Error
          ? profileError.message
          : 'Could not update your profile.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout
      title="Profile"
      subtitle="Your name, your progress, your account."
      align="top"
    >
      <div className="profile-page">
        <section className="profile-identity" aria-label="Profile summary">
          <div className="profile-identity__glow" aria-hidden="true" />
          <div className="profile-identity__row">
            <ProfileAvatar
              initials={initials}
              avatarUrl={avatarUrl}
              isUpdating={isAvatarUpdating}
              onApplyImage={applyCroppedImage}
              onRemove={() => {
                removeAvatar()
                clearAvatarError()
              }}
            />
            <div className="profile-identity__copy">
              <h2 className="profile-identity__name">{previewName}</h2>
              <p className="profile-identity__email">{user.email}</p>
              {memberSinceLabel ? (
                <p className="profile-identity__member-since">Member since {memberSinceLabel}</p>
              ) : null}
            </div>
          </div>
          {avatarError ? (
            <p className="profile-identity__avatar-error" role="alert">
              {avatarError}
            </p>
          ) : null}
        </section>

        <section className="profile-card profile-space" aria-labelledby="profile-space-heading">
          <h3 id="profile-space-heading" className="profile-card__title">
            Your space today
          </h3>
          <p className="profile-card__hint">A quick look at your personal progress.</p>

          <Link
            to={ROUTES.TODAY}
            className="profile-space__snapshot"
            aria-label={`Today's habits — ${todayLabel}`}
          >
            <div className="profile-space__copy">
              <p className="profile-space__message">{progressMessage}</p>
              <p className="profile-space__detail">{todayLabel}</p>
              <dl className="profile-space__stats">
                <div className="profile-space__stat">
                  <dt>Today</dt>
                  <dd>
                    {habits.length === 0
                      ? '—'
                      : `${progress.completed}/${progress.total} habits`}
                  </dd>
                </div>
                <div className="profile-space__stat">
                  <dt>Best streak</dt>
                  <dd>{bestStreak > 0 ? `${bestStreak} days` : '—'}</dd>
                </div>
                <div className="profile-space__stat">
                  <dt>Notes</dt>
                  <dd>
                    {notes.length} saved
                  </dd>
                </div>
              </dl>
            </div>
            <ProgressRing
              size="sm"
              percent={ringPercent}
              completed={progress.completed}
              total={ringTotal}
            />
          </Link>
        </section>

        <section className="profile-card" aria-labelledby="profile-name-heading">
          <h3 id="profile-name-heading" className="profile-card__title">
            Your name
          </h3>
          <p className="profile-card__hint">This is how we greet you on your home screen.</p>

          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <div>
              <Input
                label="What should we call you?"
                name="displayName"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                  setSaved(false)
                  setError(null)
                }}
                maxLength={DISPLAY_NAME_MAX}
                error={error ?? undefined}
              />
              <div className="profile-form__meta">
                <span className="profile-form__count">
                  {displayName.length}/{DISPLAY_NAME_MAX}
                </span>
                {isDirty ? (
                  <span className="profile-form__count profile-form__count--warn">
                    Unsaved changes
                  </span>
                ) : null}
              </div>
            </div>

            {saved ? <Alert variant="success">Profile updated successfully.</Alert> : null}

            <button
              type="submit"
              className="profile-save-btn"
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="profile-card" aria-labelledby="profile-account-heading">
          <h3 id="profile-account-heading" className="profile-card__title">
            Your account
          </h3>
          <p className="profile-card__hint">
            Your notes and habits stay on this device. Your sign-in email can&apos;t be changed
            here.
          </p>

          <Input label="Email" name="email" value={user.email} disabled readOnly />

          <Link to={ROUTES.FORGOT_PASSWORD} className="profile-link-btn">
            Change password
            <span className="profile-link-btn__chevron" aria-hidden="true">
              ›
            </span>
          </Link>
        </section>
      </div>
    </AppLayout>
  )
}
