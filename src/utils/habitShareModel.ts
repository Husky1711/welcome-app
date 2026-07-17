import type { Habit } from '../types/habit'
import { addDaysToDate, formatLocalDate } from './dateUtils'
import { getCurrentStreak } from './habitStats'
import { isHabitCompletedOnDate } from './habitStorage'

export interface HabitShareModel {
  habitId: string
  title: string
  icon: string
  streak: number
  /** Oldest → newest (7 entries). */
  last7: boolean[]
  completedInLast7: number
  headline: string
  shareText: string
  canShare: boolean
}

export function buildHabitShareModel(
  habit: Habit,
  today: string = formatLocalDate(),
): HabitShareModel {
  const streak = getCurrentStreak(habit.id, today)
  const last7: boolean[] = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    last7.push(isHabitCompletedOnDate(habit.id, addDaysToDate(today, -offset)))
  }

  const completedInLast7 = last7.filter(Boolean).length
  const canShare = streak > 0 || completedInLast7 > 0

  const headline =
    streak > 0 ? `${streak}-day streak` : `${completedInLast7} of last 7`

  const shareText =
    streak > 0
      ? `${streak}-day ${habit.title} streak — Track yours on Welcome`
      : `${habit.title}: ${completedInLast7} of last 7 days — Track yours on Welcome`

  return {
    habitId: habit.id,
    title: habit.title,
    icon: habit.icon,
    streak,
    last7,
    completedInLast7,
    headline,
    shareText,
    canShare,
  }
}
