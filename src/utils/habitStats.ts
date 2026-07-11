import type { DayProgress, DayStatus } from '../types/habit'
import { addDaysToDate, formatLocalDate, parseLocalDate } from './dateUtils'
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

export interface MonthSummary {
  percent: number
  loggedDays: number
  perfectDays: number
  partialDays: number
}

export function getMonthSummary(
  year: number,
  month: number,
  today: string = formatLocalDate(),
): MonthSummary {
  const habits = getActiveHabits()
  if (habits.length === 0) {
    return { percent: 0, loggedDays: 0, perfectDays: 0, partialDays: 0 }
  }

  const todayDate = parseLocalDate(today)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let loggedDays = 0
  let perfectDays = 0
  let partialDays = 0
  let percentSum = 0
  let dayCount = 0

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatLocalDate(new Date(year, month, day))
    if (parseLocalDate(date) > todayDate) {
      break
    }

    const status = getDayStatus(date)
    if (status === 'full') {
      loggedDays += 1
      perfectDays += 1
    } else if (status === 'partial') {
      loggedDays += 1
      partialDays += 1
    }

    percentSum += getDayProgress(date).percent
    dayCount += 1
  }

  return {
    percent: dayCount === 0 ? 0 : Math.round(percentSum / dayCount),
    loggedDays,
    perfectDays,
    partialDays,
  }
}
