import { useCallback, useMemo, useState } from 'react'
import type { DayProgress } from '../types/habit'
import { formatLocalDate } from '../utils/dateUtils'
import { getActiveHabits, isHabitCompletedOnDate } from '../utils/habitStorage'
import { getCurrentStreak, getDayProgress } from '../utils/habitStats'
import { toggleHabitCompleted } from '../utils/habitStorage'

export function useTodayTracker(date: string = formatLocalDate()) {
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  const habits = useMemo(() => getActiveHabits(), [version])
  const progress: DayProgress = useMemo(() => getDayProgress(date), [date, version])

  const completedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const habit of habits) {
      map.set(habit.id, isHabitCompletedOnDate(habit.id, date))
    }
    return map
  }, [habits, date, version])

  const streakMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const habit of habits) {
      map.set(habit.id, getCurrentStreak(habit.id, date))
    }
    return map
  }, [habits, date, version])

  const toggleHabit = useCallback(
    (habitId: string) => {
      toggleHabitCompleted(habitId, date)
      refresh()
    },
    [date, refresh],
  )

  return {
    habits,
    progress,
    completedMap,
    streakMap,
    toggleHabit,
    refresh,
  }
}
