import type { DayProgress, DayStatus } from '../types/habit'
import { addDaysToDate, formatLocalDate } from './dateUtils'
import {
  getActiveHabits,
  isHabitCompletedOnDate,
} from './habitStorage'

export function getDayProgress(date: string = formatLocalDate()): DayProgress {
  const habits = getActiveHabits()
  const total = habits.length

  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 }
  }

  const completed = habits.filter((habit) =>
    isHabitCompletedOnDate(habit.id, date),
  ).length
  const percent = Math.round((completed / total) * 100)

  return { completed, total, percent }
}

export function getCurrentStreak(habitId: string, date: string = formatLocalDate()): number {
  let streak = 0
  let cursor = date

  while (isHabitCompletedOnDate(habitId, cursor)) {
    streak += 1
    cursor = addDaysToDate(cursor, -1)
  }

  return streak
}

export function getDayStatus(date: string): DayStatus {
  const habits = getActiveHabits()
  if (habits.length === 0) return 'empty'

  const progress = getDayProgress(date)
  if (progress.completed === 0) return 'none'
  if (progress.completed === progress.total) return 'full'
  return 'partial'
}

export function getMonthDayStatuses(
  year: number,
  month: number,
): Map<string, DayStatus> {
  const statuses = new Map<string, DayStatus>()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatLocalDate(new Date(year, month, day))
    statuses.set(date, getDayStatus(date))
  }

  return statuses
}
