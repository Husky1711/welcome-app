import { DEFAULT_HABIT_SUGGESTIONS } from '../../constants/habits'
import type { HabitSuggestion } from '../../types/habit'
import { HabitToggleRow } from './HabitToggleRow'
import type { Habit } from '../../types/habit'

interface TodayHabitListProps {
  habits: Habit[]
  completedMap: Map<string, boolean>
  streakMap: Map<string, number>
  onToggle: (habitId: string) => void
  onAddSuggestion: (suggestion: HabitSuggestion) => void
  addError?: string | null
}

export function TodayHabitList({
  habits,
  completedMap,
  streakMap,
  onToggle,
  onAddSuggestion,
  addError,
}: TodayHabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-surface p-6 text-center dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Start with one small habit. Tap a suggestion below:
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {DEFAULT_HABIT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onAddSuggestion(suggestion)}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200"
            >
              {suggestion.icon} {suggestion.title}
            </button>
          ))}
        </div>

        {addError && (
          <p className="mt-3 text-sm text-error" role="alert">
            {addError}
          </p>
        )}
      </div>
    )
  }

  return (
    <ul className="space-y-2" aria-label="Today's habits">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitToggleRow
            habit={habit}
            completed={completedMap.get(habit.id) ?? false}
            streak={streakMap.get(habit.id) ?? 0}
            onToggle={onToggle}
          />
        </li>
      ))}
    </ul>
  )
}
