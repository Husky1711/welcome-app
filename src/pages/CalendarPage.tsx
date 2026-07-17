import { useEffect, useMemo, useState } from 'react'
import { InsightsCard } from '../components/habits/InsightsCard'
import { AppLayout } from '../layouts/AppLayout'
import { ensureConsistencyHistorySeed } from '../utils/consistencySeed'
import { formatLocalDate } from '../utils/dateUtils'
import { getStoryInsights, type StoryRange } from '../utils/habitInsights'
import '../styles/calendar-page.css'
import '../styles/habits-page.css'

export function CalendarPage() {
  const today = formatLocalDate()
  const [range, setRange] = useState<StoryRange>('this-week')
  const [seedTick, setSeedTick] = useState(0)

  useEffect(() => {
    const seeded = ensureConsistencyHistorySeed(today)
    if (seeded) setSeedTick((tick) => tick + 1)
  }, [today])

  const insights = useMemo(
    () => getStoryInsights(range, today),
    [range, today, seedTick],
  )

  return (
    <AppLayout align="top">
      <div className="calendar-page calendar-page--stats">
        <InsightsCard range={range} insights={insights} onRangeChange={setRange} />
      </div>
    </AppLayout>
  )
}
