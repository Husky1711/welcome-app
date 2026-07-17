import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { WeekHabitGoal } from '../../utils/habitTargetStats'
import { HabitIcon } from './HabitIcon'

interface WeeklyGoalCardsProps {
  goals: WeekHabitGoal[]
}

function DoneCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 12.5 10.5 16.5 17.5 8.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WeeklyGoalCards({ goals }: WeeklyGoalCardsProps) {
  if (goals.length === 0) {
    return (
      <section className="weekly-goals weekly-goals--empty" aria-label="Weekly goals">
        <h2 className="weekly-goals__title">Weekly goals</h2>
        <p className="weekly-goals__empty-copy">
          No weekly targets yet. Daily habits only need a check on the day you do them.
        </p>
        <p className="weekly-goals__empty-copy">
          Want something like “3 times this week”? Set a{' '}
          <Link to={ROUTES.HABITS} className="weekly-goals__link">
            Weekly goal on Habits
          </Link>
          .
        </p>
      </section>
    )
  }

  const onTrackCount = goals.filter(({ progress }) => progress.onTrack).length
  const allMet = onTrackCount === goals.length
  const headerMeta = allMet
    ? 'All met'
    : `${onTrackCount} of ${goals.length} on track`

  return (
    <section className="weekly-goals" aria-label="Weekly goals">
      <div className="weekly-goals__header">
        <h2 className="weekly-goals__title">Weekly goals</h2>
        <p className="weekly-goals__meta">{headerMeta}</p>
      </div>

      <ul className="weekly-goals__list">
        {goals.map(({ habit, progress }) => {
          const capped = Math.min(progress.completed, progress.target)
          const percent = Math.round((capped / Math.max(progress.target, 1)) * 100)

          return (
            <li
              key={habit.id}
              className={
                progress.onTrack
                  ? 'weekly-goals__row weekly-goals__row--done'
                  : 'weekly-goals__row'
              }
            >
              <span className="weekly-goals__icon" aria-hidden="true">
                <HabitIcon icon={habit.icon} size="sm" />
              </span>

              <span className="weekly-goals__name" title={habit.title}>
                {habit.title}
              </span>

              <span
                className="weekly-goals__bar"
                role="progressbar"
                aria-valuenow={capped}
                aria-valuemin={0}
                aria-valuemax={progress.target}
                aria-label={`${habit.title}, ${capped} of ${progress.target}`}
              >
                <span
                  className="weekly-goals__bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </span>

              <span className="weekly-goals__fraction">
                {capped}/{progress.target}
              </span>

              {progress.onTrack ? (
                <span className="weekly-goals__check" aria-hidden="true">
                  <DoneCheckIcon />
                </span>
              ) : (
                <span className="weekly-goals__check weekly-goals__check--spacer" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
