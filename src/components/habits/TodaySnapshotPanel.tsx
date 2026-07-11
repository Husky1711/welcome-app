import { ProgressRing } from './ProgressRing'
import { TodayStatsRow } from './TodayStatsRow'
import { CalendarNavIcon, LeafAccentIcon } from '../icons/NavIcons'
import { formatTodayHeaderDate } from '../../utils/dateUtils'
import { getTodayHeroHeadline, getTodayHeroSubtitle } from '../../utils/wellnessCopy'

interface TodaySnapshotPanelProps {
  habitCount: number
  completed: number
  total: number
  percent: number
  bestStreak: number
}

export function TodaySnapshotPanel({
  habitCount,
  completed,
  total,
  percent,
  bestStreak,
}: TodaySnapshotPanelProps) {
  const headline = getTodayHeroHeadline(habitCount, percent, completed)
  const subtitle = getTodayHeroSubtitle()
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <section className="today-snapshot" aria-label="Today's progress">
      <div className="today-snapshot__meta">
        <div className="today-snapshot__date">
          <CalendarNavIcon size={17} className="today-snapshot__date-icon" />
          <time dateTime={todayIso}>{formatTodayHeaderDate()}</time>
        </div>
        <span className="today-snapshot__pill">
          <LeafAccentIcon size={13} />
          Today
        </span>
      </div>

      <div className="today-snapshot__ring-wrap">
        <ProgressRing
          size="xl"
          percent={percent}
          completed={completed}
          total={total}
          center="custom"
        >
          <div className="today-snapshot__ring-copy">
            <LeafAccentIcon size={16} className="today-snapshot__ring-leaf" />
            <p className="today-snapshot__headline">{headline}</p>
            <p className="today-snapshot__tagline">{subtitle}</p>
          </div>
        </ProgressRing>
      </div>

      <TodayStatsRow
        completed={completed}
        total={total}
        percent={percent}
        bestStreak={bestStreak}
      />
    </section>
  )
}
