import type { DayStatus } from '../../types/habit'
import { BackChevronIcon } from '../icons/NavIcons'
import { parseLocalDate } from '../../utils/dateUtils'
import { getDayProgress } from '../../utils/habitStats'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

interface CalendarGridProps {
  monthLabel: string
  days: (string | null)[]
  dayStatuses: Map<string, DayStatus>
  selectedDate: string | null
  today: string
  onSelectDate: (date: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

function getBarPercent(date: string, status: DayStatus, today: string): number {
  if (date > today) {
    return 0
  }

  if (status === 'full') {
    return 100
  }

  if (status === 'partial') {
    return getDayProgress(date).percent
  }

  return 0
}

export function CalendarGrid({
  monthLabel,
  days,
  dayStatuses,
  selectedDate,
  today,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}: CalendarGridProps) {
  return (
    <section className="calendar-ledger" aria-label="Monthly habit calendar">
      <div className="calendar-ledger__header">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          className="calendar-ledger__nav-btn"
        >
          <BackChevronIcon size={18} />
        </button>

        <h2 className="calendar-ledger__title">{monthLabel}</h2>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="calendar-ledger__nav-btn calendar-ledger__nav-btn--next"
        >
          <BackChevronIcon size={18} />
        </button>
      </div>

      <div className="calendar-ledger__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="calendar-ledger__grid">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} aria-hidden="true" />
          }

          const dayNumber = parseLocalDate(date).getDate()
          const status = dayStatuses.get(date) ?? 'empty'
          const isToday = date === today
          const isSelected = date === selectedDate
          const isFuture = date > today
          const barPercent = getBarPercent(date, status, today)
          const isPartial = status === 'partial' && barPercent > 0 && barPercent < 100

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={`${date}, ${status} completion${isToday ? ', today' : ''}`}
              aria-pressed={isSelected}
              className={[
                'calendar-ledger__cell',
                isToday ? 'calendar-ledger__cell--today' : '',
                isSelected ? 'calendar-ledger__cell--selected' : '',
                isFuture ? 'calendar-ledger__cell--future' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="calendar-ledger__day">{dayNumber}</span>
              <span className="calendar-ledger__bar" aria-hidden="true">
                <span
                  className={[
                    'calendar-ledger__bar-fill',
                    isPartial ? 'calendar-ledger__bar-fill--partial' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ width: `${barPercent}%` }}
                />
              </span>
            </button>
          )
        })}
      </div>

      <div className="calendar-ledger__legend" aria-label="Completion legend">
        <span className="calendar-ledger__legend-item">
          <span className="calendar-ledger__legend-bar calendar-ledger__legend-bar--full" />
          All done
        </span>
        <span className="calendar-ledger__legend-item">
          <span className="calendar-ledger__legend-bar calendar-ledger__legend-bar--partial" />
          Partial
        </span>
        <span className="calendar-ledger__legend-item">
          <span className="calendar-ledger__legend-bar calendar-ledger__legend-bar--none" />
          None
        </span>
      </div>
    </section>
  )
}
