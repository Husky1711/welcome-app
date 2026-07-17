import type { Habit } from '../../types/habit'
import { canEditHabitDate, formatDayCardLabel } from '../../utils/dateUtils'
import { HabitIcon } from './HabitIcon'

interface DaySheetProps {
  date: string
  habits: Habit[]
  completedMap: Map<string, boolean>
  streakMap: Map<string, number>
  onToggle: (habitId: string) => void
}

function DoneCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M8.5 12.5 11 15l4.5-5"
        stroke="#fff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DaySheet({
  date,
  habits,
  completedMap,
  streakMap,
  onToggle,
}: DaySheetProps) {
  const editable = canEditHabitDate(date)

  return (
    <section
      className="calendar-day-card"
      aria-label={`Habits for ${formatDayCardLabel(date)}`}
    >
      <header className="calendar-day-card__header">
        <h2 className="calendar-day-card__title">{formatDayCardLabel(date)}</h2>
        {!editable ? (
          <p className="calendar-day-card__readonly">
            Read-only — only the last 7 days can be edited.
          </p>
        ) : null}
      </header>

      {habits.length === 0 ? (
        <p className="calendar-day-card__empty">
          No active habits yet. Add habits from the Habits tab.
        </p>
      ) : (
        <ul className="calendar-day-card__list" aria-label={`Habits on ${date}`}>
          {habits.map((habit) => {
            const completed = completedMap.get(habit.id) ?? false
            const streak = streakMap.get(habit.id) ?? 0
            const label = `${habit.title}, ${completed ? 'completed' : 'not completed'}${
              streak > 0 ? `, ${streak} day streak` : ''
            }`

            if (!editable) {
              return (
                <li key={habit.id} className="calendar-day-card__row">
                  <span className="calendar-day-card__icon" aria-hidden="true">
                    <HabitIcon icon={habit.icon} size="sm" />
                  </span>
                  <span
                    className={`calendar-day-card__name ${
                      completed ? 'calendar-day-card__name--done' : ''
                    }`}
                  >
                    {habit.title}
                  </span>
                  {completed ? (
                    <span className="calendar-day-card__check" aria-label={label}>
                      <DoneCheckIcon />
                    </span>
                  ) : (
                    <span className="calendar-day-card__check-empty" aria-label={label} />
                  )}
                </li>
              )
            }

            return (
              <li key={habit.id}>
                <button
                  type="button"
                  className="calendar-day-card__row calendar-day-card__row--button"
                  onClick={() => onToggle(habit.id)}
                  aria-pressed={completed}
                  aria-label={label}
                >
                  <span className="calendar-day-card__icon" aria-hidden="true">
                    <HabitIcon icon={habit.icon} size="sm" />
                  </span>
                  <span
                    className={`calendar-day-card__name ${
                      completed ? 'calendar-day-card__name--done' : ''
                    }`}
                  >
                    {habit.title}
                  </span>
                  {completed ? (
                    <span className="calendar-day-card__check" aria-hidden="true">
                      <DoneCheckIcon />
                    </span>
                  ) : (
                    <span className="calendar-day-card__check-empty" aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
