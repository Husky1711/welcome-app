import type { Habit } from '../../types/habit'
import { Button } from '../ui/Button'

interface HabitManageRowProps {
  habit: Habit
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
}

export function HabitManageRow({ habit, onEdit, onArchive }: HabitManageRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-surface px-4 py-3 dark:border-gray-700">
      <span className="text-xl" aria-hidden="true">
        {habit.icon}
      </span>

      <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-gray-100">
        {habit.title}
      </span>

      <Button
        type="button"
        variant="outline"
        onClick={() => onEdit(habit)}
        aria-label={`Edit habit ${habit.title}`}
      >
        Edit
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => onArchive(habit)}
        aria-label={`Archive habit ${habit.title}`}
        className="text-error"
      >
        Archive
      </Button>
    </div>
  )
}
