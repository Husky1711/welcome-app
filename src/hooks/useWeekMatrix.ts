import { useCallback, useMemo, useState } from 'react'
import type { Habit } from '../types/habit'
import {
  addDaysToDate,
  canEditHabitDate,
  formatLocalDate,
  getCycleWindow,
} from '../utils/dateUtils'
import {
  getActiveHabits,
  isHabitCompletedOnDate,
  toggleHabitCompleted,
} from '../utils/habitStorage'
import { getWeeklyGoalsForWeek } from '../utils/habitTargetStats'
import type { WeekHabitGoal } from '../utils/habitTargetStats'

export function useWeekMatrix(anchorDate: string = formatLocalDate()) {
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  const today = formatLocalDate()
  const habits: Habit[] = useMemo(() => getActiveHabits(), [version])

  const weekDates = useMemo(() => {
    const { start } = getCycleWindow(anchorDate, 'weekly')
    return Array.from({ length: 7 }, (_, index) => addDaysToDate(start, index))
  }, [anchorDate])

  const weeklyGoals: WeekHabitGoal[] = useMemo(
    () => getWeeklyGoalsForWeek(anchorDate),
    [anchorDate, version],
  )

  const isCompleted = useCallback(
    (habitId: string, date: string) => {
      void version
      return isHabitCompletedOnDate(habitId, date)
    },
    [version],
  )

  const toggleCell = useCallback(
    (habitId: string, date: string) => {
      if (date > today || !canEditHabitDate(date)) return
      toggleHabitCompleted(habitId, date)
      refresh()
    },
    [today, refresh],
  )

  return {
    today,
    habits,
    weekDates,
    weeklyGoals,
    isCompleted,
    toggleCell,
    refresh,
  }
}
