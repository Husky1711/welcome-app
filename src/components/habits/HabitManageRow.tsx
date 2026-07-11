import type { Habit } from '../../types/habit'
import { formatReminderTimeLabel } from '../../services/habitReminderService'
import { BellReminderIcon } from '../icons/NavIcons'
import { HabitIcon } from './HabitIcon'

interface HabitManageRowProps {
  habit: Habit
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
}

export function HabitManageRow({ habit, onEdit, onArchive }: HabitManageRowProps) {
  return (
    <li className="habit-card">
      <div className="habit-card__icon-wrap">
        <HabitIcon icon={habit.icon} size="md" />
      </div>

      <div className="habit-card__body">
        <h3 className="habit-card__title">{habit.title}</h3>
        {habit.reminderEnabled ? (
          <span className="habit-card__reminder">
            <BellReminderIcon />
            Reminder {formatReminderTimeLabel(habit.reminderTime)}
          </span>
        ) : null}
      </div>

      <div className="habit-card__actions">
        <button
          type="button"
          className="habit-card__action habit-card__action--edit"
          onClick={() => onEdit(habit)}
          aria-label={`Edit habit ${habit.title}`}
        >
          Edit
        </button>
        <hr className="habit-card__action-divider" aria-hidden="true" />
        <button
          type="button"
          className="habit-card__action habit-card__action--archive"
          onClick={() => onArchive(habit)}
          aria-label={`Archive habit ${habit.title}`}
        >
          Archive
        </button>
      </div>
    </li>
  )
}
