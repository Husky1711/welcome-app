import { useMemo, useState } from 'react'
import { TodayHabitList } from '../components/habits/TodayHabitList'
import { TodaySnapshotPanel } from '../components/habits/TodaySnapshotPanel'
import { useHabits } from '../hooks/useHabits'
import { useTodayTracker } from '../hooks/useTodayTracker'
import { AppLayout } from '../layouts/AppLayout'
import type { HabitSuggestion } from '../types/habit'
import '../styles/habits-page.css'
import '../styles/today-page.css'

export function TodayPage() {
  const { createHabit } = useHabits()
  const { habits, progress, completedMap, streakMap, toggleHabit, refresh } = useTodayTracker()
  const [addError, setAddError] = useState<string | null>(null)

  const bestStreak = useMemo(() => {
    if (streakMap.size === 0) {
      return 0
    }
    return Math.max(...streakMap.values())
  }, [streakMap])

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
    <AppLayout
      title="Today"
      subtitle="Your day. Your work. Your space."
      showBrand
      align="top"
    >
      <div className="today-page">
        {habits.length > 0 ? (
          <TodaySnapshotPanel
            habitCount={habits.length}
            completed={progress.completed}
            total={progress.total}
            percent={progress.percent}
            bestStreak={bestStreak}
          />
        ) : null}

        <section className="today-page__habits" aria-label="Daily habits">
          {habits.length > 0 ? (
            <h2 className="today-page__section-title">Daily habits</h2>
          ) : null}
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
