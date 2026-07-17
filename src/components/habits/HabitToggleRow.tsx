import type { Habit } from '../../types/habit'
import { HabitIcon } from './HabitIcon'

interface HabitToggleRowProps {
  habit: Habit
  completed: boolean
  streak: number
  onToggle: (habitId: string) => void
}

export function HabitToggleRow({ habit, completed, streak, onToggle }: HabitToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-surface px-4 py-3 text-left shadow-sm transition hover:border-primary/40 dark:border-gray-700"
      aria-pressed={completed}
      aria-label={`${habit.title}, ${completed ? 'completed' : 'not completed'}${streak > 0 ? `, ${streak} day streak` : ''}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? 'border-primary bg-primary text-white'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        aria-hidden="true"
      >
        {completed ? '✓' : ''}
      </span>

      <HabitIcon icon={habit.icon} size="sm" className="habit-toggle-row__icon" />

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-medium ${
            completed
              ? 'text-gray-500 line-through dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {habit.title}
        </span>
        {streak > 0 && (
          <span className="type-stat-sm text-primary">
            {streak} day streak
          </span>
        )}
      </span>
    </button>
  )
}
