import type { DayProgress } from '../types/habit'
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
