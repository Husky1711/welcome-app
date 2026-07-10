import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const TRACKER_LINKS = [
  { to: ROUTES.TODAY, label: 'Today' },
  { to: ROUTES.CALENDAR, label: 'Calendar' },
  { to: ROUTES.HABITS, label: 'Habits' },
] as const

export function TrackerNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Tracker sections"
      className="flex rounded-lg border border-gray-200 bg-surface p-1 dark:border-gray-700"
    >
      {TRACKER_LINKS.map((link) => {
        const isActive = location.pathname === link.to

        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-primary dark:text-gray-400'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
