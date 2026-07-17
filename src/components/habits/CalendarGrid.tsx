import type { DayStatus } from '../../types/habit'
import { BackChevronIcon } from '../icons/NavIcons'
import { parseLocalDate } from '../../utils/dateUtils'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

interface CalendarGridProps {
  monthLabel: string
  days: (string | null)[]
  dayStatuses: Map<string, DayStatus>
  selectedDate: string | null
  highlightDates?: Set<string>
  today: string
  onSelectDate: (date: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({
  monthLabel,
  days,
  dayStatuses,
  selectedDate,
  highlightDates,
  today,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}: CalendarGridProps) {
  return (
    <section className="calendar-month" aria-label="Monthly habit calendar">
      <div className="calendar-month__header">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          className="calendar-month__nav-btn"
        >
          <BackChevronIcon size={18} />
        </button>

        <h2 className="calendar-month__title">{monthLabel}</h2>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="calendar-month__nav-btn calendar-month__nav-btn--next"
        >
          <BackChevronIcon size={18} />
        </button>
      </div>

      <div className="calendar-month__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="calendar-month__grid">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-month__cell-empty" aria-hidden="true" />
          }

          const dayNumber = parseLocalDate(date).getDate()
          const status = dayStatuses.get(date) ?? 'empty'
          const isToday = date === today
          const isSelected = selectedDate !== null && date === selectedDate
          const isHighlighted = Boolean(highlightDates?.has(date)) && !isSelected
          const isFuture = date > today
          const isLogged = !isFuture && (status === 'full' || status === 'partial')

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={`${date}, ${status} completion${isToday ? ', today' : ''}`}
              aria-pressed={isSelected}
              className={[
                'calendar-month__cell',
                isLogged ? 'calendar-month__cell--logged' : '',
                status === 'full' ? 'calendar-month__cell--full' : '',
                status === 'partial' ? 'calendar-month__cell--partial' : '',
                isToday ? 'calendar-month__cell--today' : '',
                isSelected ? 'calendar-month__cell--selected' : '',
                isHighlighted ? 'calendar-month__cell--range' : '',
                isFuture ? 'calendar-month__cell--future' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="calendar-month__day">{dayNumber}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
