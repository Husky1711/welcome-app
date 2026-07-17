import type { Habit, HabitTarget, TargetPeriod } from '../types/habit'
import {
  addDaysToDate,
  eachDateInRange,
  formatLocalDate,
  getCycleWindow,
  type DateStringRange,
} from './dateUtils'
import {
  countCompletedLogsInRange,
  getActiveHabits,
  getActiveTarget,
  getTargetForDate,
} from './habitStorage'

export interface CycleProgress {
  habitId: string
  period: TargetPeriod
  completed: number
  target: number
  onTrack: boolean
  window: DateStringRange
}

export interface OnTrackProgress {
  onTrack: number
  total: number
  percent: number
}

export interface WeekDayPulse {
  date: string
  label: string
  percent: number
  isToday: boolean
  isSelected: boolean
}

export interface WeekHabitGoal {
  habit: Habit
  progress: CycleProgress
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function resolveTarget(
  habitId: string,
  dateStr: string,
): HabitTarget | null {
  return getTargetForDate(habitId, dateStr) ?? getActiveTarget(habitId, dateStr)
}

function clampRangeToTarget(
  window: DateStringRange,
  target: HabitTarget,
): DateStringRange {
  // Approach A: mid-week goal changes still count earlier days in the same ISO week.
  // Only clamp the end so a closed contract does not absorb later logs.
  const endBound =
    target.endDate === null || target.endDate > window.end
      ? window.end
      : target.endDate

  return { start: window.start, end: endBound }
}

export function getHabitCycleProgress(
  habitId: string,
  dateStr: string = formatLocalDate(),
): CycleProgress | null {
  const target = resolveTarget(habitId, dateStr)
  if (!target) return null

  const window = getCycleWindow(dateStr, target.period)
  const range = clampRangeToTarget(window, target)
  const completed =
    range.start > range.end
      ? 0
      : countCompletedLogsInRange(habitId, range.start, range.end)

  return {
    habitId,
    period: target.period,
    completed,
    target: target.targetFrequency,
    onTrack: completed >= target.targetFrequency,
    window,
  }
}

export function isHabitOnTrack(
  habitId: string,
  dateStr: string = formatLocalDate(),
): boolean {
  return getHabitCycleProgress(habitId, dateStr)?.onTrack ?? false
}

export function getOnTrackProgress(
  dateStr: string = formatLocalDate(),
): OnTrackProgress {
  const habits = getActiveHabits()
  const total = habits.length

  if (total === 0) {
    return { onTrack: 0, total: 0, percent: 0 }
  }

  const onTrack = habits.filter((habit) => isHabitOnTrack(habit.id, dateStr)).length
  return {
    onTrack,
    total,
    percent: Math.round((onTrack / total) * 100),
  }
}

/**
 * Consecutive met cycles for the current period type.
 * Period changes end the streak (daily ↔ weekly do not convert).
 */
export function getCurrentCycleStreak(
  habitId: string,
  dateStr: string = formatLocalDate(),
): number {
  const active = resolveTarget(habitId, dateStr)
  if (!active) return 0

  let streak = 0
  let cursor = dateStr
  let period: TargetPeriod | null = null

  for (let guard = 0; guard < 400; guard += 1) {
    const target = resolveTarget(habitId, cursor)
    if (!target) break
    if (period !== null && target.period !== period) break
    period = target.period

    const window = getCycleWindow(cursor, target.period)
    const range = clampRangeToTarget(window, target)
    const completed =
      range.start > range.end
        ? 0
        : countCompletedLogsInRange(habitId, range.start, range.end)

    if (completed < target.targetFrequency) {
      if (streak === 0 && cursor === dateStr) {
        cursor = addDaysToDate(window.start, -1)
        continue
      }
      break
    }

    streak += 1
    cursor = addDaysToDate(window.start, -1)
  }

  return streak
}

export function getWeekDayPulses(
  dateStr: string = formatLocalDate(),
  selectedDate: string | null = null,
  today: string = formatLocalDate(),
): WeekDayPulse[] {
  const { start } = getCycleWindow(dateStr, 'weekly')
  const dates = eachDateInRange(start, addDaysToDate(start, 6))
  const habits = getActiveHabits()
  const total = habits.length

  return dates.map((date, index) => {
    let percent = 0
    if (total > 0 && date <= today) {
      const logged = habits.filter((habit) =>
        countCompletedLogsInRange(habit.id, date, date) > 0,
      ).length
      percent = Math.round((logged / total) * 100)
    }

    return {
      date,
      label: WEEKDAY_SHORT[index],
      percent,
      isToday: date === today,
      isSelected: selectedDate === date,
    }
  })
}

export function getWeeklyGoalsForWeek(
  dateStr: string = formatLocalDate(),
): WeekHabitGoal[] {
  const habits = getActiveHabits()
  const goals: WeekHabitGoal[] = []

  for (const habit of habits) {
    const progress = getHabitCycleProgress(habit.id, dateStr)
    if (!progress || progress.period !== 'weekly') continue
    goals.push({ habit, progress })
  }

  return goals
}
