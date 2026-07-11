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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function canEditHabitDate(date: string, today: string = formatLocalDate()): boolean {
  const diff = daysBetween(date, today)
  return diff >= 0 && diff <= PAST_EDIT_DAYS
}

export function getCalendarMonthDays(year: number, month: number): (string | null)[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
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
