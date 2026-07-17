import { useState } from 'react'
import { WeekMatrix } from '../components/habits/WeekMatrix'
import { WeeklyGoalCards } from '../components/habits/WeeklyGoalCards'
import { TodayHabitList } from '../components/habits/TodayHabitList'
import { useHabits } from '../hooks/useHabits'
import { useWeekMatrix } from '../hooks/useWeekMatrix'
import { AppLayout } from '../layouts/AppLayout'
import type { HabitSuggestion } from '../types/habit'
import '../styles/habits-page.css'
import '../styles/today-page.css'

export function TodayPage() {
  const { createHabit } = useHabits()
  const { today, habits, weekDates, weeklyGoals, isCompleted, toggleCell, refresh } =
    useWeekMatrix()
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
    <AppLayout
      title="Today"
      subtitle="Your week at a glance. Tap a circle to check in."
      showBrand
      align="top"
    >
      <div className="today-page">
        {habits.length === 0 ? (
          <TodayHabitList
            habits={habits}
            completedMap={new Map()}
            streakMap={new Map()}
            onToggle={() => undefined}
            onAddSuggestion={handleAddSuggestion}
            addError={addError}
          />
        ) : (
          <>
            <WeekMatrix
              habits={habits}
              weekDates={weekDates}
              today={today}
              isCompleted={isCompleted}
              onToggle={toggleCell}
            />
            <WeeklyGoalCards goals={weeklyGoals} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
