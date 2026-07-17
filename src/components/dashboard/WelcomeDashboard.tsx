import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AccountSheet } from './AccountSheet'
import { ProgressRing } from '../habits/ProgressRing'
import { ChevronRightIcon, NotesFeatureIcon } from '../icons/NavIcons'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../hooks/useNotes'
import { useProfileAvatar } from '../../hooks/useProfileAvatar'
import { useTodayTracker } from '../../hooks/useTodayTracker'
import { getProgressMessage, getTodayStatusLabel } from '../../utils/wellnessCopy'
import signInBackground from '../../assets/sign-in-background.png'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WelcomeDashboard() {
  const { user } = useAuth()
  const { notes } = useNotes()
  const { habits, progress } = useTodayTracker()
  const { avatarUrl } = useProfileAvatar(user?.email)
  const [accountOpen, setAccountOpen] = useState(false)

  if (!user) {
    return null
  }

  const statusLabel = getTodayStatusLabel(
    habits.length,
    progress.completed,
    progress.total,
    progress.percent,
  )

  const progressMessage = getProgressMessage(habits.length, progress.percent, progress.completed)
  const firstName = user.displayName.split(/\s+/).filter(Boolean)[0] || user.displayName
  const initials = user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const doneLabel =
    habits.length === 0
      ? 'Start a habit'
      : `${progress.completed} done`

  return (
    <div className="welcome-dashboard">
      <section className="welcome-dashboard__hero" aria-label="Welcome">
        <div className="welcome-dashboard__hero-bg" aria-hidden="true">
          <img src={signInBackground} alt="" />
        </div>
        <div className="welcome-dashboard__hero-shade" aria-hidden="true" />

        <div className="welcome-dashboard__hero-top">
          <p className="welcome-dashboard__brand">Welcome</p>

          <button
            type="button"
            className="welcome-dashboard__account-chip"
            onClick={() => setAccountOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={accountOpen}
            aria-label="Open account menu"
          >
            <span className="welcome-dashboard__account-avatar" aria-hidden="true">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="welcome-dashboard__account-avatar-image" />
              ) : (
                <span className="welcome-dashboard__account-initials">{initials || '?'}</span>
              )}
            </span>
            <span className="welcome-dashboard__account-name">{firstName}</span>
          </button>
        </div>

        <div className="welcome-dashboard__hero-copy">
          <p className="welcome-dashboard__salutation">{getTimeGreeting()}</p>
          <h1 className="welcome-dashboard__greeting">Welcome, {user.displayName}</h1>
        </div>
      </section>

      <div className="welcome-dashboard__sheet">
        <Link
          to={ROUTES.TODAY}
          className="welcome-dashboard__today"
          aria-label={`Daily Tracker — ${statusLabel}`}
        >
          <div className="welcome-dashboard__today-copy">
            <p className="welcome-dashboard__today-kicker">Today</p>
            <h2 className="welcome-dashboard__today-title">{doneLabel}</h2>
            <p className="welcome-dashboard__today-message">{progressMessage}</p>
          </div>
          <ProgressRing
            size="md"
            percent={habits.length === 0 ? 0 : progress.percent}
            completed={progress.completed}
            total={habits.length === 0 ? 0 : progress.total}
          />
        </Link>

        <Link to={ROUTES.NOTES} className="welcome-dashboard__notes">
          <span className="welcome-dashboard__notes-icon" aria-hidden="true">
            <NotesFeatureIcon />
          </span>
          <span className="welcome-dashboard__notes-copy">
            <span className="welcome-dashboard__notes-title">My Notes</span>
            <span className="welcome-dashboard__notes-meta">
              {notes.length} private note{notes.length === 1 ? '' : 's'} saved
            </span>
          </span>
          <span className="welcome-dashboard__notes-chevron" aria-hidden="true">
            <ChevronRightIcon />
          </span>
        </Link>
      </div>

      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  )
}
