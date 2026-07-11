import { ProgressRing } from './ProgressRing'
import { CalendarNavIcon, LeafAccentIcon } from '../icons/NavIcons'
import type { MonthSummary } from '../../utils/habitStats'

interface CalendarMonthSnapshotProps {
  monthLabel: string
  summary: MonthSummary
}

function StatCalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function StatPartialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function CalendarMonthSnapshot({ monthLabel, summary }: CalendarMonthSnapshotProps) {
  return (
    <section className="calendar-snapshot" aria-label="Month progress">
      <div className="calendar-snapshot__meta">
        <div className="calendar-snapshot__date">
          <CalendarNavIcon size={17} className="calendar-snapshot__date-icon" />
          <span>{monthLabel}</span>
        </div>
        <span className="calendar-snapshot__pill">
          <LeafAccentIcon size={13} />
          This month
        </span>
      </div>

      <div className="calendar-snapshot__body">
        <div className="calendar-snapshot__ring-wrap">
          <ProgressRing
            size="md"
            percent={summary.percent}
            completed={summary.perfectDays}
            total={Math.max(summary.loggedDays, 1)}
            center="custom"
          >
            <div className="calendar-snapshot__ring-copy">
              <span className="calendar-snapshot__percent">{summary.percent}%</span>
              <span className="calendar-snapshot__ring-label">month</span>
            </div>
          </ProgressRing>
        </div>

        <dl className="calendar-stats" aria-label="Month summary">
          <div className="calendar-stats__item">
            <dt className="calendar-stats__label">
              <span className="calendar-stats__icon" aria-hidden="true">
                <StatCalendarIcon />
              </span>
              Days logged
            </dt>
            <dd className="calendar-stats__value">{summary.loggedDays}</dd>
          </div>

          <div className="calendar-stats__item">
            <dt className="calendar-stats__label">
              <span className="calendar-stats__icon" aria-hidden="true">
                <StatStarIcon />
              </span>
              Perfect
            </dt>
            <dd className="calendar-stats__value">{summary.perfectDays}</dd>
          </div>

          <div className="calendar-stats__item">
            <dt className="calendar-stats__label">
              <span className="calendar-stats__icon" aria-hidden="true">
                <StatPartialIcon />
              </span>
              Partial
            </dt>
            <dd className="calendar-stats__value">{summary.partialDays}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
