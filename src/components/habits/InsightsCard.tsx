import type { StoryInsights, StoryRange } from '../../utils/habitInsights'
import { HabitIcon } from './HabitIcon'

interface InsightsCardProps {
  range: StoryRange
  insights: StoryInsights
  onRangeChange: (range: StoryRange) => void
}

const RANGE_OPTIONS: ReadonlyArray<{ value: StoryRange; label: string }> = [
  { value: 'this-week', label: 'This week' },
  { value: 'last-week', label: 'Last week' },
  { value: 'last-month', label: 'Last month' },
]

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

function CompletionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.8 17.2 19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActiveHabitsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  )
}

function PerformanceRing({ percent }: { percent: number }) {
  // Design: chunky fill arc + thin pale track (not equal stroke widths).
  const size = 136
  const trackStroke = 5
  const fillStroke = 16
  const radius = (size - fillStroke) / 2
  const circumference = 2 * Math.PI * radius
  const safe = Math.min(100, Math.max(0, percent))
  const offset = circumference * (1 - safe / 100)

  return (
    <div className="insights-stats__ring" aria-hidden="true">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="insights-stats__ring-svg"
      >
        <circle
          className="insights-stats__ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={trackStroke}
        />
        <circle
          className="insights-stats__ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={fillStroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="insights-stats__ring-copy">
        <span className="insights-stats__ring-value">{percent}%</span>
        <span className="insights-stats__ring-label">On track</span>
      </div>
    </div>
  )
}

export function InsightsCard({ range, insights, onRangeChange }: InsightsCardProps) {
  const hasHabits = insights.habits.length > 0

  return (
    <section className="insights-stats" aria-label="Insights">
      <header className="insights-stats__top">
        <h1 className="insights-stats__page-title">Insights</h1>
      </header>

      <div className="insights-stats__modes" role="group" aria-label="Time range">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              'insights-stats__mode',
              range === option.value ? 'insights-stats__mode--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={range === option.value}
            onClick={() => onRangeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <section className="insights-stats__overall" aria-label="Overall performance">
        <header className="insights-stats__overall-head">
          <h2 className="insights-stats__overall-title">Overall performance</h2>
          <p className="insights-stats__overall-summary">{insights.summaryLabel}</p>
        </header>

        <div className="insights-stats__overall-body">
          <PerformanceRing percent={insights.performancePercent} />

          <ul className="insights-stats__metrics">
            <li className="insights-stats__metric">
              <span className="insights-stats__metric-icon" aria-hidden="true">
                <CompletionsIcon />
              </span>
              <span className="insights-stats__metric-copy">
                <span className="insights-stats__metric-value">
                  {insights.completionsDone}/{insights.completionsTotal}
                </span>
                <span className="insights-stats__metric-label">Completions</span>
              </span>
            </li>
            <li className="insights-stats__metric">
              <span className="insights-stats__metric-icon" aria-hidden="true">
                <ActiveHabitsIcon />
              </span>
              <span className="insights-stats__metric-copy">
                <span className="insights-stats__metric-value">{insights.activeHabits}</span>
                <span className="insights-stats__metric-label">Active habits</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="insights-stats__map" aria-label="Consistency map">
        <header className="insights-stats__map-head">
          <h2 className="insights-stats__map-title">Consistency map</h2>
          <p className="insights-stats__map-range">Last 5 weeks</p>
        </header>

        <div className="insights-stats__map-grid" role="table" aria-label="Last 5 weeks activity">
          <span className="insights-stats__map-corner" aria-hidden="true" />
          {WEEKDAY_LETTERS.map((letter, index) => (
            <span key={`${letter}-${index}`} className="insights-stats__map-day" role="columnheader">
              {letter}
            </span>
          ))}

          {insights.consistencyWeeks.flatMap((week) => [
            <span key={`${week.label}-label`} className="insights-stats__map-week" role="rowheader">
              {week.label}
            </span>,
            ...week.days.map((cell) => (
              <span
                key={cell.date}
                className={[
                  'insights-stats__map-cell',
                  `insights-stats__map-cell--l${cell.level}`,
                  cell.isFuture ? 'insights-stats__map-cell--future' : '',
                  cell.isToday ? 'insights-stats__map-cell--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={cell.date}
                role="cell"
              />
            )),
          ])}
        </div>

        <div className="insights-stats__map-legend" aria-hidden="true">
          <span>Less</span>
          <span className="insights-stats__map-swatch insights-stats__map-cell--l0" />
          <span className="insights-stats__map-swatch insights-stats__map-cell--l1" />
          <span className="insights-stats__map-swatch insights-stats__map-cell--l2" />
          <span className="insights-stats__map-swatch insights-stats__map-cell--l3" />
          <span>More</span>
        </div>
      </section>

      <section className="insights-stats__habits-block" aria-label="Your habits">
        <h2 className="insights-stats__habits-title">Your habits</h2>

        {!hasHabits ? (
          <p className="insights-stats__empty">Add habits to see performance.</p>
        ) : (
          <ul className="insights-stats__habits">
            {insights.habits.map((row) => (
              <li key={row.habitId} className="insights-stats__habit">
                <span className="insights-stats__habit-icon">
                  <HabitIcon icon={row.icon} size="sm" />
                </span>
                <div className="insights-stats__habit-body">
                  <span className="insights-stats__habit-title">{row.title}</span>
                  <div className="insights-stats__habit-meter">
                    <span className="insights-stats__habit-track" aria-hidden="true">
                      <span
                        className="insights-stats__habit-fill"
                        style={{ width: `${row.percent}%` }}
                      />
                    </span>
                    <span className="insights-stats__habit-percent">{row.percent}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
