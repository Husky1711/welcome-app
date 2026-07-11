import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProgressRing } from '../habits/ProgressRing'
import {
  CalendarNavIcon,
  ChevronRightIcon,
  HabitsNavIcon,
  NotesFeatureIcon,
  ProfileFeatureIcon,
  SettingsFeatureIcon,
} from '../icons/NavIcons'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../hooks/useNotes'
import { useTodayTracker } from '../../hooks/useTodayTracker'
import { getProgressMessage, getTodayStatusLabel } from '../../utils/wellnessCopy'
import signInBackground from '../../assets/sign-in-background.png'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 17) return 'Good afternoon!'
  return 'Good evening!'
}

interface BentoTileProps {
  to: string
  title: string
  description: string
  icon: ReactNode
  accent?: boolean
}

function BentoTile({ to, title, description, icon, accent = false }: BentoTileProps) {
  return (
    <Link
      to={to}
      className={`welcome-dashboard__tile ${accent ? 'welcome-dashboard__tile--accent' : ''}`}
    >
      <span className="welcome-dashboard__tile-chevron" aria-hidden="true">
        <ChevronRightIcon />
      </span>
      <span className="welcome-dashboard__tile-icon" aria-hidden="true">
        {icon}
      </span>
      <h2 className="welcome-dashboard__tile-title">{title}</h2>
      <p className="welcome-dashboard__tile-desc">{description}</p>
    </Link>
  )
}

export function WelcomeDashboard() {
  const { user } = useAuth()
  const { notes } = useNotes()
  const { habits, progress } = useTodayTracker()

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

  return (
    <div className="welcome-dashboard">
      <section className="welcome-dashboard__hero" aria-label="Welcome">
        <div className="welcome-dashboard__hero-bg" aria-hidden="true">
          <img src={signInBackground} alt="" />
        </div>
        <div className="welcome-dashboard__hero-shade" aria-hidden="true" />

        <div className="welcome-dashboard__hero-top">
          <h1 className="welcome-dashboard__greeting">Welcome, {user.displayName}</h1>
          <p className="welcome-dashboard__salutation">{getTimeGreeting()}</p>
          <p className="welcome-dashboard__email">{user.email}</p>
          <p className="welcome-dashboard__status">You are signed in to your personal space.</p>
        </div>

        <Link
          to={ROUTES.TODAY}
          className="welcome-dashboard__progress-card"
          aria-label={`Daily Tracker — ${statusLabel}`}
        >
          <div className="welcome-dashboard__progress-copy">
            <h2 className="welcome-dashboard__progress-title">Today&apos;s Progress</h2>
            <p className="welcome-dashboard__progress-message">{progressMessage}</p>
            <p className="welcome-dashboard__progress-detail">{statusLabel}</p>
          </div>
          <ProgressRing
            size="lg"
            tone="light"
            percent={habits.length === 0 ? 0 : progress.percent}
            completed={progress.completed}
            total={habits.length === 0 ? 0 : progress.total}
          />
        </Link>
      </section>

      <div className="welcome-dashboard__body">
        <section aria-label="App features" className="welcome-dashboard__bento">
          <BentoTile
            to={ROUTES.NOTES}
            title="My Notes"
            description={`${notes.length} private note${notes.length === 1 ? '' : 's'} saved`}
            icon={<NotesFeatureIcon />}
          />
          <BentoTile
            to={ROUTES.HABITS}
            title="Habits"
            description="Manage your daily habits"
            icon={<HabitsNavIcon />}
          />
          <BentoTile
            to={ROUTES.PROFILE}
            title="Profile"
            description="Your name and progress"
            icon={<ProfileFeatureIcon />}
          />
          <BentoTile
            to={ROUTES.SETTINGS}
            title="Settings"
            description="Theme, privacy, and app data"
            icon={<SettingsFeatureIcon />}
          />
          <BentoTile
            to={ROUTES.CALENDAR}
            title="Insights"
            description="Explore your progress over time"
            icon={<CalendarNavIcon />}
            accent
          />
        </section>
      </div>
    </div>
  )
}
