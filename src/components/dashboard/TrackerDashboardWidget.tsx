import { Link } from 'react-router-dom'
import { ProgressRing } from '../habits/ProgressRing'
import { ROUTES } from '../../constants/routes'
import { useTodayTracker } from '../../hooks/useTodayTracker'

export function TrackerDashboardWidget() {
  const { habits, progress } = useTodayTracker()

  if (habits.length === 0) {
    return (
      <Link
        to={ROUTES.TODAY}
        className="flex items-start gap-4 rounded-lg border border-gray-200 bg-surface p-4 shadow-sm transition-colors hover:border-primary hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl"
          aria-hidden="true"
        >
          📅
        </span>
        <div>
          <h2 className="font-medium text-gray-900 dark:text-gray-100">Daily Tracker</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Build daily habits with a simple checklist
          </p>
        </div>
      </Link>
    )
  }

  const statusLabel =
    progress.percent === 100
      ? 'All habits done today'
      : progress.completed === 0
        ? `${habits.length} habit${habits.length === 1 ? '' : 's'} waiting`
        : `${progress.completed} of ${progress.total} done today`

  return (
    <Link
      to={ROUTES.TODAY}
      className="flex items-center gap-4 rounded-lg border border-gray-200 bg-surface p-4 shadow-sm transition-colors hover:border-primary hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
      aria-label={`Daily Tracker — ${statusLabel}`}
    >
      <ProgressRing
        size="sm"
        percent={progress.percent}
        completed={progress.completed}
        total={progress.total}
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-medium text-gray-900 dark:text-gray-100">Daily Tracker</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{statusLabel}</p>
      </div>
    </Link>
  )
}
