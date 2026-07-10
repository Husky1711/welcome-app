import type { Habit } from '../../types/habit'
import { canEditHabitDate, formatShortDate } from '../../utils/dateUtils'
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

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={onClose}>
      <section
        role="dialog"
        aria-label={`Habits for ${formatShortDate(date)}`}
        className="max-h-[70vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatShortDate(date)}
            </h2>
            {!editable && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Read-only — only the last 7 days can be edited.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close day details"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {habits.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No active habits yet. Add habits from the Habits tab.
          </p>
        ) : (
          <ul className="space-y-2" aria-label={`Habits on ${date}`}>
            {habits.map((habit) => (
              <li key={habit.id}>
                {editable ? (
                  <HabitToggleRow
                    habit={habit}
                    completed={completedMap.get(habit.id) ?? false}
                    streak={streakMap.get(habit.id) ?? 0}
                    onToggle={onToggle}
                  />
                ) : (
                  <div
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40"
                    aria-label={`${habit.title}, ${
                      completedMap.get(habit.id) ? 'completed' : 'not completed'
                    }, read only`}
                  >
                    <span aria-hidden="true">{habit.icon}</span>
                    <span
                      className={`flex-1 ${
                        completedMap.get(habit.id)
                          ? 'text-gray-500 line-through dark:text-gray-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {completedMap.get(habit.id) ? 'Done' : 'Not done'}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
