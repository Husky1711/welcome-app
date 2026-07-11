import type { Habit } from '../../types/habit'
import { getHabitEncouragement } from '../../utils/habitEncouragement'
import { HabitIcon } from './HabitIcon'

interface TodayHabitCardProps {
  habit: Habit
  completed: boolean
  streak: number
  onToggle: (habitId: string) => void
}

export function TodayHabitCard({ habit, completed, streak, onToggle }: TodayHabitCardProps) {
  const encouragement = getHabitEncouragement(habit, completed)

  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      className={`note-card today-habit-card ${completed ? 'today-habit-card--completed' : ''}`}
      aria-pressed={completed}
      aria-label={`${habit.title}, ${completed ? 'completed' : 'not completed'}${streak > 0 ? `, ${streak} day streak` : ''}`}
    >
      <div className="today-habit-card__layout">
        <div className="habit-card__icon-wrap">
          <HabitIcon icon={habit.icon} size="md" />
        </div>

        <div className="today-habit-card__copy">
          <span className="note-card__title today-habit-card__title">{habit.title}</span>
          <span className="note-card__body today-habit-card__subtitle">{encouragement}</span>
          {streak > 0 ? (
            <span className="habit-card__reminder today-habit-card__streak">
              {streak} day streak
            </span>
          ) : null}
        </div>

        <span
          className={`today-habit-card__check ${completed ? 'today-habit-card__check--done' : ''}`}
          aria-hidden="true"
        >
          {completed ? '✓' : ''}
        </span>
      </div>
    </button>
  )
}
