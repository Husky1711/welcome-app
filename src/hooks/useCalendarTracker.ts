import { useCallback, useMemo, useState } from 'react'
import { formatLocalDate, getCalendarMonthDays } from '../utils/dateUtils'
import { getActiveHabits } from '../utils/habitStorage'
import { getMonthDayStatuses } from '../utils/habitStats'

export function useCalendarTracker(initialDate: Date = new Date()) {
  const [viewDate, setViewDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<string | null>(() => formatLocalDate())
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
  const activeDate = selectedDate ?? today

  const goToPreviousMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }, [])

  return {
    viewDate,
    today,
    days,
    dayStatuses,
    habits,
    selectedDate: activeDate,
    setSelectedDate,
    goToPreviousMonth,
    goToNextMonth,
    refresh,
  }
}
