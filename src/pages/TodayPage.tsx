import { useState } from 'react'
import { TrackerNav } from '../components/habits/TrackerNav'
import { ProgressRing } from '../components/habits/ProgressRing'
import { TodayHabitList } from '../components/habits/TodayHabitList'
import { ROUTES } from '../constants/routes'
import { useHabits } from '../hooks/useHabits'
import { useTodayTracker } from '../hooks/useTodayTracker'
import { AppLayout } from '../layouts/AppLayout'
import { formatDisplayDate } from '../utils/dateUtils'
import type { HabitSuggestion } from '../types/habit'

export function TodayPage() {
  const { createHabit } = useHabits()
  const { habits, progress, completedMap, streakMap, toggleHabit, refresh } = useTodayTracker()
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddSuggestion = (suggestion: HabitSuggestion) => {
    try {
      setAddError(null)
      createHabit(suggestion)
      refresh()
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Could not add habit.')
    }
  }

  return (
    <AppLayout title="Today" backTo={ROUTES.WELCOME} align="top">
      <div className="space-y-6">
        <TrackerNav />

        <header className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDisplayDate()}</p>
        </header>

        {habits.length > 0 && (
          <div className="flex justify-center">
            <ProgressRing
              percent={progress.percent}
              completed={progress.completed}
              total={progress.total}
            />
          </div>
        )}

        <section aria-label="Daily habits">
          <TodayHabitList
            habits={habits}
            completedMap={completedMap}
            streakMap={streakMap}
            onToggle={toggleHabit}
            onAddSuggestion={handleAddSuggestion}
            addError={addError}
          />
        </section>
      </div>
    </AppLayout>
  )
}
