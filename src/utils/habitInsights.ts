import type { Habit } from '../types/habit'
import {
  eachDateInRange,
  formatDayCardLabel,
  formatLocalDate,
  formatMonthYear,
  formatShortDate,
  getCycleWindow,
  parseLocalDate,
  addDaysToDate,
} from './dateUtils'
import {
  getActiveHabits,
  getTargetForDate,
  isHabitCompletedOnDate,
} from './habitStorage'
import { getHabitCycleProgress, getOnTrackProgress } from './habitTargetStats'

export type InsightsMode = 'day' | 'week' | 'month'

export interface InsightsBar {
  key: string
  label: string
  percent: number
  isHighlighted?: boolean
}

export interface InsightsHabitRow {
  habitId: string
  title: string
  icon: string
  status: 'met' | 'missed' | 'partial'
  detail: string
}

export interface HabitInsights {
  mode: InsightsMode
  title: string
  headlineLabel: string
  headlineValue: string
  headlineDetail: string
  /** Week/day sparkline only — month uses the calendar above, not a second day grid. */
  bars: InsightsBar[]
  /** Month: single progress fill (0–100). Null for day/week. */
  progressPercent: number | null
  habits: InsightsHabitRow[]
  empty: boolean
}

export interface InsightsMonthDot {
  key: string
  percent: number
  isToday?: boolean
  isFuture?: boolean
}

export type StoryRange = 'this-week' | 'last-week' | 'last-month'

export interface StoryHabitPerf {
  habitId: string
  title: string
  icon: string
  detail: string
  percent: number
  status: 'met' | 'partial' | 'missed'
}

export interface ConsistencyCell {
  date: string
  level: 0 | 1 | 2 | 3
  isFuture: boolean
  isToday: boolean
}

export interface ConsistencyWeek {
  label: string
  days: ConsistencyCell[]
}

export interface StoryInsights {
  range: StoryRange
  onTrack: number
  behind: number
  total: number
  /** Ring value — completions rate for the selected period (matches design). */
  performancePercent: number
  summaryLabel: string
  ringLabel: string
  completionsDone: number
  completionsTotal: number
  activeHabits: number
  consistencyWeeks: ConsistencyWeek[]
  habits: StoryHabitPerf[]
  empty: boolean
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function clampToToday(date: string, today: string): string {
  return date > today ? today : date
}

function dayLoggedPercent(habits: Habit[], date: string): number {
  if (habits.length === 0) return 0
  const logged = habits.filter((habit) => isHabitCompletedOnDate(habit.id, date)).length
  return Math.round((logged / habits.length) * 100)
}

function habitStatusFromPercent(percent: number): 'met' | 'partial' | 'missed' {
  if (percent >= 100) return 'met'
  if (percent >= 50) return 'partial'
  return 'missed'
}

function frequencyLabel(period: 'daily' | 'weekly' | undefined, frequency: number): string {
  if (period === 'weekly') return `weekly · ${frequency}×`
  return `daily · ${frequency}×`
}

function buildHabitPerformance(
  habits: Habit[],
  range: StoryRange,
  scoreDate: string,
  periodDates: string[],
): StoryHabitPerf[] {
  return habits.map((habit) => {
    const target = getTargetForDate(habit.id, scoreDate)
    const freq = frequencyLabel(target?.period, target?.targetFrequency ?? 1)

    if (range === 'last-month') {
      const daysDone = periodDates.filter((date) =>
        isHabitCompletedOnDate(habit.id, date),
      ).length
      const percent =
        periodDates.length === 0 ? 0 : Math.round((daysDone / periodDates.length) * 100)

      return {
        habitId: habit.id,
        title: habit.title,
        icon: habit.icon,
        detail: freq,
        percent,
        status: habitStatusFromPercent(percent),
      }
    }

    const progress = getHabitCycleProgress(habit.id, scoreDate)
    if (!progress) {
      return {
        habitId: habit.id,
        title: habit.title,
        icon: habit.icon,
        detail: freq,
        percent: 0,
        status: 'missed' as const,
      }
    }

    if (progress.period === 'daily') {
      const daysDone = periodDates.filter((date) =>
        isHabitCompletedOnDate(habit.id, date),
      ).length
      const percent =
        periodDates.length === 0 ? 0 : Math.round((daysDone / periodDates.length) * 100)
      return {
        habitId: habit.id,
        title: habit.title,
        icon: habit.icon,
        detail: freq,
        percent,
        status: habitStatusFromPercent(percent),
      }
    }

    const percent =
      progress.target === 0
        ? 0
        : Math.min(100, Math.round((progress.completed / progress.target) * 100))
    return {
      habitId: habit.id,
      title: habit.title,
      icon: habit.icon,
      detail: freq,
      percent,
      status: progress.onTrack ? 'met' : progress.completed > 0 ? 'partial' : 'missed',
    }
  })
}

function resolveStoryWindow(
  range: StoryRange,
  today: string,
): {
  scoreDate: string
  sparklineDates: string[]
  monthStart: string
  monthEnd: string
} {
  if (range === 'last-month') {
    const todayDate = parseLocalDate(today)
    const year = todayDate.getFullYear()
    const month = todayDate.getMonth() - 1
    const monthStart = formatLocalDate(new Date(year, month, 1))
    const monthEnd = formatLocalDate(new Date(year, month + 1, 0))
    return {
      scoreDate: monthEnd,
      sparklineDates: eachDateInRange(monthStart, monthEnd),
      monthStart,
      monthEnd,
    }
  }

  const anchor =
    range === 'last-week' ? addDaysToDate(getCycleWindow(today, 'weekly').start, -1) : today
  const { start, end } = getCycleWindow(anchor, 'weekly')

  return {
    scoreDate: range === 'this-week' ? today : end,
    sparklineDates: eachDateInRange(start, end),
    monthStart: start,
    monthEnd: end,
  }
}

function activityLevel(percent: number, isFuture: boolean): 0 | 1 | 2 | 3 {
  if (isFuture || percent <= 0) return 0
  if (percent < 34) return 1
  if (percent < 67) return 2
  return 3
}

function buildConsistencyMap(
  habits: Habit[],
  today: string,
): ConsistencyWeek[] {
  const { start: thisWeekStart } = getCycleWindow(today, 'weekly')
  const mapStart = addDaysToDate(thisWeekStart, -28) // 4 weeks before current week
  const weeks: ConsistencyWeek[] = []

  for (let week = 0; week < 5; week += 1) {
    const weekStart = addDaysToDate(mapStart, week * 7)
    const dates = eachDateInRange(weekStart, addDaysToDate(weekStart, 6))
    weeks.push({
      label: `W${week + 1}`,
      days: dates.map((date) => {
        const isFuture = date > today
        const percent = isFuture ? 0 : dayLoggedPercent(habits, date)
        return {
          date,
          level: activityLevel(percent, isFuture),
          isFuture,
          isToday: date === today,
        }
      }),
    })
  }

  return weeks
}

function summaryLabelFor(range: StoryRange): string {
  if (range === 'last-week') return 'Summary for last week'
  if (range === 'last-month') return 'Summary for last month'
  return 'Summary for this week'
}

function countCompletions(
  habits: Habit[],
  periodDates: string[],
): { done: number; total: number } {
  const total = habits.length * periodDates.length
  if (total === 0) return { done: 0, total: 0 }

  let done = 0
  for (const habit of habits) {
    for (const date of periodDates) {
      if (isHabitCompletedOnDate(habit.id, date)) done += 1
    }
  }
  return { done, total }
}

/** Insights overview matching the merged design (ring + map + habits). */
export function getStoryInsights(
  range: StoryRange = 'this-week',
  today: string = formatLocalDate(),
): StoryInsights {
  const habits = getActiveHabits()
  const window = resolveStoryWindow(range, today)

  const periodDates =
    range === 'last-month'
      ? eachDateInRange(window.monthStart, window.monthEnd)
      : window.sparklineDates.filter((date) => date <= today)

  const perfHabits = buildHabitPerformance(habits, range, window.scoreDate, periodDates)

  let onTrack = 0
  let behind = 0
  if (range === 'last-month') {
    onTrack = perfHabits.filter((row) => row.status === 'met').length
    behind = Math.max(0, perfHabits.length - onTrack)
  } else {
    const progress = getOnTrackProgress(window.scoreDate)
    onTrack = progress.onTrack
    behind = Math.max(0, progress.total - progress.onTrack)
  }

  const total = habits.length
  const completions = countCompletions(habits, periodDates)
  const performancePercent =
    completions.total === 0
      ? 0
      : Math.round((completions.done / completions.total) * 100)

  return {
    range,
    onTrack,
    behind,
    total,
    performancePercent,
    summaryLabel: summaryLabelFor(range),
    ringLabel: 'On track',
    completionsDone: completions.done,
    completionsTotal: completions.total,
    activeHabits: total,
    consistencyWeeks: buildConsistencyMap(habits, today),
    habits: perfHabits,
    empty: habits.length === 0,
  }
}

export function getInsightsForDay(
  date: string,
  today: string = formatLocalDate(),
): HabitInsights {
  const habits = getActiveHabits()
  const safeDate = clampToToday(date, today)

  if (habits.length === 0) {
    return {
      mode: 'day',
      title: formatShortDate(safeDate),
      headlineLabel: 'Logged',
      headlineValue: '—',
      headlineDetail: 'Add habits to see insights.',
      bars: [],
      progressPercent: null,
      habits: [],
      empty: true,
    }
  }

  const logged = habits.filter((habit) => isHabitCompletedOnDate(habit.id, safeDate)).length
  const percent = Math.round((logged / habits.length) * 100)

  const habitRows: InsightsHabitRow[] = habits.map((habit) => {
    const done = isHabitCompletedOnDate(habit.id, safeDate)
    const target = getTargetForDate(habit.id, safeDate)
    const periodNote =
      target?.period === 'weekly' ? ` · weekly goal ${target.targetFrequency}×` : ''

    return {
      habitId: habit.id,
      title: habit.title,
      icon: habit.icon,
      status: done ? 'met' : 'missed',
      detail: done ? `Logged${periodNote}` : `Not logged${periodNote}`,
    }
  })

  return {
    mode: 'day',
    title: formatShortDate(safeDate),
    headlineLabel: 'Habits logged',
    headlineValue: `${logged}/${habits.length}`,
    headlineDetail:
      percent === 100
        ? 'Every habit was logged this day.'
        : logged === 0
          ? 'No check-ins on this day.'
          : `${percent}% of habits logged.`,
    bars: [
      {
        key: safeDate,
        label: formatDayCardLabel(safeDate),
        percent,
        isHighlighted: true,
      },
    ],
    progressPercent: null,
    habits: habitRows,
    empty: logged === 0,
  }
}

export function getInsightsForWeek(
  anchorDate: string = formatLocalDate(),
  today: string = formatLocalDate(),
): HabitInsights {
  const habits = getActiveHabits()
  const { start, end } = getCycleWindow(anchorDate, 'weekly')
  const rangeEnd = clampToToday(end, today)
  const dates = eachDateInRange(start, end)

  if (habits.length === 0) {
    return {
      mode: 'week',
      title: 'This week',
      headlineLabel: 'On track',
      headlineValue: '—',
      headlineDetail: 'Add habits to see insights.',
      bars: [],
      progressPercent: null,
      habits: [],
      empty: true,
    }
  }

  const scoreDate = clampToToday(
    anchorDate >= start && anchorDate <= end ? anchorDate : rangeEnd,
    today,
  )
  const onTrack = getOnTrackProgress(scoreDate)

  const bars: InsightsBar[] = dates.map((date, index) => ({
    key: date,
    label: WEEKDAY_SHORT[index],
    percent: date > today ? 0 : dayLoggedPercent(habits, date),
    isHighlighted: date === scoreDate,
  }))

  const habitRows: InsightsHabitRow[] = habits.map((habit) => {
    const progress = getHabitCycleProgress(habit.id, scoreDate)
    if (!progress) {
      return {
        habitId: habit.id,
        title: habit.title,
        icon: habit.icon,
        status: 'missed' as const,
        detail: 'No goal',
      }
    }

    if (progress.period === 'daily') {
      const doneToday = isHabitCompletedOnDate(habit.id, scoreDate)
      return {
        habitId: habit.id,
        title: habit.title,
        icon: habit.icon,
        status: doneToday ? 'met' : 'missed',
        detail: doneToday ? 'Daily · done today' : 'Daily · not today',
      }
    }

    return {
      habitId: habit.id,
      title: habit.title,
      icon: habit.icon,
      status: progress.onTrack ? 'met' : progress.completed > 0 ? 'partial' : 'missed',
      detail: progress.onTrack
        ? `Weekly · goal met (${progress.completed}/${progress.target})`
        : `Weekly · ${progress.completed} of ${progress.target} days`,
    }
  })

  const anyLogs = dates.some(
    (date) => date <= today && habits.some((habit) => isHabitCompletedOnDate(habit.id, date)),
  )

  return {
    mode: 'week',
    title: 'This week',
    headlineLabel: 'On track',
    headlineValue: `${onTrack.onTrack}/${onTrack.total}`,
    headlineDetail:
      onTrack.percent === 100
        ? 'All habits are on track this week.'
        : onTrack.onTrack === 0
          ? 'No habits on track yet this week.'
          : `${onTrack.percent}% of habits on track.`,
    bars,
    progressPercent: null,
    habits: habitRows,
    empty: !anyLogs,
  }
}

export function getInsightsForMonth(
  year: number,
  month: number,
  today: string = formatLocalDate(),
): HabitInsights {
  const habits = getActiveHabits()
  const monthStart = formatLocalDate(new Date(year, month, 1))
  const monthEnd = formatLocalDate(new Date(year, month + 1, 0))
  const rangeEnd = clampToToday(monthEnd, today)
  const title = formatMonthYear(new Date(year, month, 1))

  if (habits.length === 0) {
    return {
      mode: 'month',
      title,
      headlineLabel: 'Days logged',
      headlineValue: '—',
      headlineDetail: 'Add habits to see insights.',
      bars: [],
      progressPercent: null,
      habits: [],
      empty: true,
    }
  }

  if (monthStart > today) {
    return {
      mode: 'month',
      title,
      headlineLabel: 'Days logged',
      headlineValue: '0',
      headlineDetail: 'This month has not started yet.',
      bars: [],
      progressPercent: null,
      habits: [],
      empty: true,
    }
  }

  const dates = eachDateInRange(monthStart, rangeEnd)
  let loggedDays = 0

  for (const date of dates) {
    if (dayLoggedPercent(habits, date) > 0) loggedDays += 1
  }

  const percent = dates.length === 0 ? 0 : Math.round((loggedDays / dates.length) * 100)

  const habitRows: InsightsHabitRow[] = habits.map((habit) => {
    const daysDone = dates.filter((date) => isHabitCompletedOnDate(habit.id, date)).length
    const ratio = dates.length === 0 ? 0 : daysDone / dates.length

    return {
      habitId: habit.id,
      title: habit.title,
      icon: habit.icon,
      status: ratio >= 0.8 ? 'met' : daysDone > 0 ? 'partial' : 'missed',
      detail: `${daysDone} of ${dates.length} days logged`,
    }
  })

  return {
    mode: 'month',
    title,
    headlineLabel: 'Days logged',
    headlineValue: `${loggedDays}/${dates.length}`,
    headlineDetail:
      loggedDays === 0
        ? 'No check-ins in this month yet.'
        : `${percent}% of days so far had at least one habit.`,
    // Calendar grid already shows the month — no second day grid here.
    bars: [],
    progressPercent: percent,
    habits: habitRows,
    empty: loggedDays === 0,
  }
}

export function getInsightsForSelection(
  mode: InsightsMode,
  focusDate: string,
  viewYear: number,
  viewMonth: number,
  today: string = formatLocalDate(),
): HabitInsights {
  if (mode === 'day') {
    return getInsightsForDay(focusDate, today)
  }
  if (mode === 'week') {
    return getInsightsForWeek(focusDate, today)
  }
  return getInsightsForMonth(viewYear, viewMonth, today)
}

/** Highlight helpers for the month grid when week/month mode is active. */
export function getInsightHighlightDates(
  mode: InsightsMode,
  focusDate: string,
  viewYear: number,
  viewMonth: number,
  today: string = formatLocalDate(),
): Set<string> {
  const highlights = new Set<string>()

  if (mode === 'day') {
    highlights.add(clampToToday(focusDate, today))
    return highlights
  }

  if (mode === 'week') {
    const { start, end } = getCycleWindow(focusDate, 'weekly')
    for (const date of eachDateInRange(start, end)) {
      highlights.add(date)
    }
    return highlights
  }

  const monthStart = formatLocalDate(new Date(viewYear, viewMonth, 1))
  const monthEnd = formatLocalDate(new Date(viewYear, viewMonth + 1, 0))
  const rangeEnd = clampToToday(monthEnd, today)
  if (monthStart <= today) {
    for (const date of eachDateInRange(monthStart, rangeEnd)) {
      highlights.add(date)
    }
  }
  return highlights
}
