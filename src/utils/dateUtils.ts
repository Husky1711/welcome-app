import { PAST_EDIT_DAYS } from '../constants/habits'

export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTodayHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

export function addDaysToDate(date: string, days: number): string {
  const next = parseLocalDate(date)
  next.setDate(next.getDate() + days)
  return formatLocalDate(next)
}

export function formatMonthYear(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function formatMemberSince(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** Compact day-card title matching Calendar design, e.g. "Thu 16". */
export function formatDayCardLabel(date: string): string {
  return parseLocalDate(date).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  })
}

export function canEditHabitDate(date: string, today: string = formatLocalDate()): boolean {
  const diff = daysBetween(date, today)
  return diff >= 0 && diff <= PAST_EDIT_DAYS
}

/** Monday-first month grid (ISO week aligned). */
export function getCalendarMonthDays(year: number, month: number): (string | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = []

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatLocalDate(new Date(year, month, day)))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export interface DateStringRange {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

/** ISO week Mon–Sun (or single day for daily). All values are local YYYY-MM-DD strings. */
export function getCycleWindow(
  dateStr: string,
  period: 'daily' | 'weekly',
): DateStringRange {
  if (period === 'daily') {
    return { start: dateStr, end: dateStr }
  }

  const date = parseLocalDate(dateStr)
  const mondayOffset = (date.getDay() + 6) % 7
  const start = addDaysToDate(dateStr, -mondayOffset)
  const end = addDaysToDate(start, 6)
  return { start, end }
}

export function eachDateInRange(start: string, end: string): string[] {
  if (start > end) return []

  const dates: string[] = []
  let cursor = start
  while (cursor <= end) {
    dates.push(cursor)
    cursor = addDaysToDate(cursor, 1)
  }
  return dates
}
