import { DEFAULT_HABIT_SUGGESTIONS } from '../../constants/habits'
import type { HabitSuggestion } from '../../types/habit'
import { TodayHabitCard } from './TodayHabitCard'
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
      <div className="today-empty">
        <p className="today-empty__title">Start with one small habit</p>
        <p className="today-empty__hint">Tap a suggestion below to add your first daily ritual.</p>

        <div className="today-empty__suggestions">
          {DEFAULT_HABIT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={() => onAddSuggestion(suggestion)}
              className="today-empty__suggestion"
            >
              <span className="today-empty__suggestion-icon" aria-hidden="true">
                {suggestion.icon}
              </span>
              {suggestion.title}
            </button>
          ))}
        </div>

        {addError ? (
          <p className="today-empty__error" role="alert">
            {addError}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <ul className="today-habit-list" aria-label="Today's habits">
      {habits.map((habit) => (
        <li key={habit.id}>
          <TodayHabitCard
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
