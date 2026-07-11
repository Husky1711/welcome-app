import type { DayStatus } from '../../types/habit'
import { parseLocalDate } from '../../utils/dateUtils'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const STATUS_DOT_CLASS: Record<DayStatus, string> = {
  empty: 'bg-transparent',
  none: 'bg-gray-300 dark:bg-gray-600',
  partial: 'bg-amber-400',
  full: 'bg-primary',
}

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
    <div className="rounded-lg border border-gray-200 bg-surface p-4 dark:border-gray-700">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="Previous month"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
        >
          ←
        </button>

        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{monthLabel}</h2>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Next month"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} aria-hidden="true" />
          }

          const dayNumber = parseLocalDate(date).getDate()
          const status = dayStatuses.get(date) ?? 'empty'
          const isToday = date === today
          const isSelected = date === selectedDate

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={`${date}, ${status} completion${isToday ? ', today' : ''}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center rounded-lg px-1 py-2 text-sm transition ${
                isSelected
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span
                className={`font-medium ${
                  isToday ? 'text-primary' : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {dayNumber}
              </span>
              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[status]}`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
