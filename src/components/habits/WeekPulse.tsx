import type { Habit } from '../../types/habit'
import type { WeekDayPulse, WeekHabitGoal } from '../../utils/habitTargetStats'
import { HabitIcon } from './HabitIcon'

interface WeekPulseProps {
  pulses: WeekDayPulse[]
  weeklyGoals: WeekHabitGoal[]
  onSelectDate: (date: string) => void
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export function WeekPulse({ pulses, weeklyGoals, onSelectDate }: WeekPulseProps) {
  return (
    <section className="week-pulse" aria-label="This week">
      <header className="week-pulse__header">
        <h2 className="week-pulse__title">This week</h2>
      </header>

      <div className="week-pulse__bars" role="list">
        {pulses.map((pulse) => (
          <button
            key={pulse.date}
            type="button"
            role="listitem"
            className={[
              'week-pulse__day',
              pulse.isToday ? 'week-pulse__day--today' : '',
              pulse.isSelected ? 'week-pulse__day--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectDate(pulse.date)}
            aria-label={`${pulse.label} ${pulse.date}, ${pulse.percent}% logged`}
            aria-pressed={pulse.isSelected}
          >
            <span className="week-pulse__bar-track" aria-hidden="true">
              <span
                className="week-pulse__bar-fill"
                style={{ height: `${Math.max(pulse.percent, pulse.percent > 0 ? 12 : 0)}%` }}
              />
            </span>
            <span className="week-pulse__day-label">{pulse.label}</span>
          </button>
        ))}
      </div>

      {weeklyGoals.length > 0 ? (
        <ul className="week-pulse__goals">
          {weeklyGoals.map(({ habit, progress }) => (
            <WeekGoalRow key={habit.id} habit={habit} progress={progress} />
          ))}
        </ul>
      ) : (
        <p className="week-pulse__empty">No weekly goals yet. Set one on Habits.</p>
      )}
    </section>
  )
}

function WeekGoalRow({
  habit,
  progress,
}: {
  habit: Habit
  progress: WeekHabitGoal['progress']
}) {
  const ratio = Math.min(1, progress.completed / Math.max(progress.target, 1))
  const complete = progress.onTrack

  return (
    <li className="week-pulse__goal">
      <div className="week-pulse__goal-icon">
        <HabitIcon icon={habit.icon} size="sm" />
      </div>
      <div className="week-pulse__goal-body">
        <div className="week-pulse__goal-top">
          <span className="week-pulse__goal-title">{habit.title}</span>
          {complete ? (
            <span className="week-pulse__goal-complete">
              Complete
              <CheckIcon />
            </span>
          ) : (
            <span className="week-pulse__goal-count">
              {progress.completed} / {progress.target}
            </span>
          )}
        </div>
        {!complete ? (
          <div className="week-pulse__goal-track" aria-hidden="true">
            <span
              className="week-pulse__goal-fill"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        ) : null}
      </div>
    </li>
  )
}
