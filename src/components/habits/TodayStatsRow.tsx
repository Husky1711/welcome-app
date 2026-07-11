interface TodayStatsRowProps {
  completed: number
  total: number
  percent: number
  bestStreak: number
}

function StatCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 12.2 10.5 15l6-6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatFlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5c-2 2.5-3.5 4.5-3.5 7a3.5 3.5 0 0 0 7 0c0-1.5-.8-3-2-4.5 1 1.2 1.5 2.4 1.5 3.8a5.5 5.5 0 1 1-11 0c0-3 1.8-5.6 4-7.3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatStarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 4.5 1.45 3.35 3.65.35-2.75 2.35.85 3.55L12 12.9l-3.2 1.65.85-3.55-2.75-2.35 3.65-.35L12 4.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TodayStatsRow({ completed, total, percent, bestStreak }: TodayStatsRowProps) {
  return (
    <dl className="today-stats" aria-label="Today's progress summary">
      <div className="today-stats__item">
        <dt className="today-stats__label">
          <span className="today-stats__icon" aria-hidden="true">
            <StatCheckIcon />
          </span>
          Today
        </dt>
        <dd className="today-stats__value">
          {completed} / {total}
        </dd>
      </div>

      <div className="today-stats__item">
        <dt className="today-stats__label">
          <span className="today-stats__icon" aria-hidden="true">
            <StatFlameIcon />
          </span>
          Best streak
        </dt>
        <dd className="today-stats__value">{bestStreak > 0 ? `${bestStreak} days` : '—'}</dd>
      </div>

      <div className="today-stats__item">
        <dt className="today-stats__label">
          <span className="today-stats__icon" aria-hidden="true">
            <StatStarIcon />
          </span>
          Completion
        </dt>
        <dd className="today-stats__value">{percent}%</dd>
      </div>
    </dl>
  )
}
