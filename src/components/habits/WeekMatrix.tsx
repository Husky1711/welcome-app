import type { Habit } from '../../types/habit'
import { canEditHabitDate, parseLocalDate } from '../../utils/dateUtils'
import { HabitIcon } from './HabitIcon'

interface WeekMatrixProps {
  habits: Habit[]
  weekDates: string[]
  today: string
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
}

function CellCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 12.5 10 16l7.5-8"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function dayLetter(date: string): string {
  return parseLocalDate(date).toLocaleDateString(undefined, { weekday: 'narrow' })
}

export function WeekMatrix({
  habits,
  weekDates,
  today,
  isCompleted,
  onToggle,
}: WeekMatrixProps) {
  return (
    <section className="week-matrix" aria-label="This week's habit grid">
      <p className="week-matrix__hint">
        Each row is a habit. Each circle is a day. Filled means you did it.
      </p>

      <div
        className="week-matrix__grid"
        style={{ gridTemplateRows: `auto repeat(${habits.length}, auto)` }}
      >
        <div className="week-matrix__corner" aria-hidden="true" />
        {weekDates.map((date) => {
          const isToday = date === today
          return (
            <div
              key={date}
              className={[
                'week-matrix__day-head',
                isToday ? 'week-matrix__day-head--today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="week-matrix__day-letter">{dayLetter(date)}</span>
              {isToday ? <span className="week-matrix__today-tag">Today</span> : null}
            </div>
          )
        })}

        {habits.map((habit) => (
          <WeekMatrixRow
            key={habit.id}
            habit={habit}
            weekDates={weekDates}
            today={today}
            isCompleted={isCompleted}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  )
}

function WeekMatrixRow({
  habit,
  weekDates,
  today,
  isCompleted,
  onToggle,
}: {
  habit: Habit
  weekDates: string[]
  today: string
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
}) {
  return (
    <>
      <div className="week-matrix__habit">
        <span className="week-matrix__habit-icon">
          <HabitIcon icon={habit.icon} size="sm" />
        </span>
        <span className="week-matrix__habit-name" title={habit.title}>
          {habit.title}
        </span>
      </div>

      {weekDates.map((date) => {
        const done = isCompleted(habit.id, date)
        const isFuture = date > today
        const editable = !isFuture && canEditHabitDate(date)
        const isToday = date === today

        if (!editable) {
          return (
            <div
              key={`${habit.id}-${date}`}
              className={[
                'week-matrix__cell',
                'week-matrix__cell--static',
                done ? 'week-matrix__cell--done' : '',
                isToday ? 'week-matrix__cell--today-col' : '',
                isFuture ? 'week-matrix__cell--future' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${habit.title}, ${date}, ${done ? 'done' : 'not done'}${
                isFuture ? ', future' : ', read only'
              }`}
            >
              <span className="week-matrix__mark" aria-hidden="true">
                {done ? <CellCheckIcon /> : null}
              </span>
            </div>
          )
        }

        return (
          <button
            key={`${habit.id}-${date}`}
            type="button"
            className={[
              'week-matrix__cell',
              done ? 'week-matrix__cell--done' : '',
              isToday ? 'week-matrix__cell--today-col' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={done}
            aria-label={`${habit.title}, ${date}, ${done ? 'done' : 'not done'}`}
            onClick={() => onToggle(habit.id, date)}
          >
            <span className="week-matrix__mark" aria-hidden="true">
              {done ? <CellCheckIcon /> : null}
            </span>
          </button>
        )
      })}
    </>
  )
}
