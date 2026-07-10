import { useCallback, useMemo, useState } from 'react'
import { formatLocalDate, getCalendarMonthDays } from '../utils/dateUtils'
import { getActiveHabits, isHabitCompletedOnDate } from '../utils/habitStorage'
import { getCurrentStreak, getMonthDayStatuses } from '../utils/habitStats'

export function useCalendarTracker(initialDate: Date = new Date()) {
  const [viewDate, setViewDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const today = formatLocalDate()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const refresh = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  const days = useMemo(() => getCalendarMonthDays(year, month), [year, month])
  const dayStatuses = useMemo(() => getMonthDayStatuses(year, month), [year, month, version])
  const habits = useMemo(() => getActiveHabits(), [version])

  const selectedCompletedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    if (!selectedDate) return map

    for (const habit of habits) {
      map.set(habit.id, isHabitCompletedOnDate(habit.id, selectedDate))
    }
    return map
  }, [habits, selectedDate, version])

  const selectedStreakMap = useMemo(() => {
    const map = new Map<string, number>()
    if (!selectedDate) return map

    for (const habit of habits) {
      map.set(habit.id, getCurrentStreak(habit.id, selectedDate))
    }
    return map
  }, [habits, selectedDate, version])

  const goToPreviousMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
    setSelectedDate(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
    setSelectedDate(null)
  }, [])

  return {
    viewDate,
    today,
    days,
    dayStatuses,
    habits,
    selectedDate,
    selectedCompletedMap,
    selectedStreakMap,
    setSelectedDate,
    goToPreviousMonth,
    goToNextMonth,
    refresh,
  }
}
