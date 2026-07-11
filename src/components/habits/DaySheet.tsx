import type { Habit } from '../../types/habit'
import { canEditHabitDate, formatShortDate } from '../../utils/dateUtils'
import { HabitIcon } from './HabitIcon'
import { HabitToggleRow } from './HabitToggleRow'

interface DaySheetProps {
  date: string
  habits: Habit[]
  completedMap: Map<string, boolean>
  streakMap: Map<string, number>
  onToggle: (habitId: string) => void
  onClose: () => void
}

export function DaySheet({
  date,
  habits,
  completedMap,
  streakMap,
  onToggle,
  onClose,
}: DaySheetProps) {
  const editable = canEditHabitDate(date)
  const completedCount = habits.filter((habit) => completedMap.get(habit.id)).length
  const totalCount = habits.length

  return (
    <div className="calendar-day-sheet-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-label={`Habits for ${formatShortDate(date)}`}
        className="calendar-day-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="calendar-day-sheet__header">
          <div>
            <h2 className="calendar-day-sheet__title">{formatShortDate(date)}</h2>
            {habits.length > 0 ? (
              <p className="calendar-day-sheet__summary">
                {completedCount} of {totalCount} complete
              </p>
            ) : null}
            {!editable && (
              <p className="calendar-day-sheet__readonly">
                Read-only — only the last 7 days can be edited.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close day details"
            className="calendar-day-sheet__close"
          >
            ✕
          </button>
        </div>

        {habits.length === 0 ? (
          <p className="calendar-day-sheet__empty">
            No active habits yet. Add habits from the Habits tab.
          </p>
        ) : (
          <ul className="calendar-day-sheet__list" aria-label={`Habits on ${date}`}>
            {habits.map((habit) => {
              const completed = completedMap.get(habit.id) ?? false

              return (
                <li key={habit.id}>
                  {editable ? (
                    <HabitToggleRow
                      habit={habit}
                      completed={completed}
                      streak={streakMap.get(habit.id) ?? 0}
                      onToggle={onToggle}
                    />
                  ) : (
                    <div
                      className={`note-card calendar-day-sheet__readonly-card ${
                        completed ? 'calendar-day-sheet__readonly-card--done' : ''
                      }`}
                      aria-label={`${habit.title}, ${
                        completed ? 'completed' : 'not completed'
                      }, read only`}
                    >
                      <div className="habit-card__icon-wrap">
                        <HabitIcon icon={habit.icon} size="md" />
                      </div>
                      <span className="note-card__title">{habit.title}</span>
                      <span className="calendar-day-sheet__readonly-status">
                        {completed ? 'Done' : 'Not done'}
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
