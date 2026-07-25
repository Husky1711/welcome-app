import { useMemo, useState } from 'react'
import { InsightsCard } from '../components/habits/InsightsCard'
import { AppLayout } from '../layouts/AppLayout'
import { formatLocalDate } from '../utils/dateUtils'
import { getStoryInsights, type StoryRange } from '../utils/habitInsights'
import '../styles/calendar-page.css'
import '../styles/habits-page.css'

export function CalendarPage() {
  const today = formatLocalDate()
  const [range, setRange] = useState<StoryRange>('this-week')

  // Insights use genuine habit logs only. Synthetic consistency seeding was
  // removed from production so Coach/AI never trains on fabricated history.
  const insights = useMemo(() => getStoryInsights(range, today), [range, today])

  return (
    <AppLayout align="top">
      <div className="calendar-page calendar-page--stats">
        <InsightsCard range={range} insights={insights} onRangeChange={setRange} />
      </div>
    </AppLayout>
  )
}
