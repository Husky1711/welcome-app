import type { Habit } from '../../types/habit'
import { formatReminderTimeLabel } from '../../services/habitReminderService'
import { getActiveTarget } from '../../utils/habitStorage'
import { HabitIcon } from './HabitIcon'

interface HabitManageRowProps {
  habit: Habit
  onEdit: (habit: Habit) => void
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5.5 15.5 12 9 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HabitManageRow({ habit, onEdit }: HabitManageRowProps) {
  const target = getActiveTarget(habit.id)
  const goalLabel =
    target?.period === 'weekly'
      ? `Weekly · ${target.targetFrequency}×`
      : 'Daily · 1×'

  const reminderLabel = habit.reminderEnabled
    ? formatReminderTimeLabel(habit.reminderTime)
    : null

  return (
    <li className="habit-sheet__row">
      <button
        type="button"
        className="habit-sheet__row-main"
        onClick={() => onEdit(habit)}
        aria-label={`Edit habit ${habit.title}`}
      >
        <span className="habit-sheet__icon" aria-hidden="true">
          <HabitIcon icon={habit.icon} size="md" />
        </span>

        <span className="habit-sheet__body">
          <span className="habit-sheet__title">{habit.title}</span>
          <span className="habit-sheet__meta">
            <span>{goalLabel}</span>
            {reminderLabel ? (
              <span className="habit-card__reminder habit-sheet__reminder">
                · {reminderLabel}
              </span>
            ) : null}
          </span>
        </span>

        <span className="habit-sheet__chevron" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>
    </li>
  )
}
