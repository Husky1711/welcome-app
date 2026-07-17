export function normalizeReminderTime(time: string): string | null {
  const trimmed = time.trim()
  const withSeconds = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed)
  if (!withSeconds) return null

  const hour = Number(withSeconds[1])
  const minute = Number(withSeconds[2])
  if (hour > 23 || minute > 59) return null

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function parseReminderTime(time: string): { hour: number; minute: number } | null {
  const normalized = normalizeReminderTime(time)
  if (!normalized) return null

  const match = /^(\d{2}):(\d{2})$/.exec(normalized)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

export function getSuggestedReminderTime(now: Date = new Date(), minutesAhead = 3): string {
  const target = new Date(now.getTime() + minutesAhead * 60_000)
  return `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`
}

export function hasReminderTimePassedToday(time: string, now: Date = new Date()): boolean {
  const parsed = parseReminderTime(time)
  if (!parsed) return false

  const todayAtTime = new Date(now)
  todayAtTime.setSeconds(0, 0)
  todayAtTime.setMilliseconds(0)
  todayAtTime.setHours(parsed.hour, parsed.minute, 0, 0)

  return todayAtTime.getTime() <= now.getTime()
}

export function getNextReminderFireDate(time: string, now: Date = new Date()): Date {
  const parsed = parseReminderTime(time)
  if (!parsed) return now

  const next = new Date(now)
  next.setSeconds(0, 0)
  next.setMilliseconds(0)
  next.setHours(parsed.hour, parsed.minute, 0, 0)

  if (next.getTime() < now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

export function getMinutesUntilNextReminder(time: string, now: Date = new Date()): number {
  const next = getNextReminderFireDate(time, now)
  return Math.max(1, Math.round((next.getTime() - now.getTime()) / 60_000))
}

export function formatNextReminderLabel(time: string, now: Date = new Date()): string {
  const next = getNextReminderFireDate(time, now)
  const minutesUntil = Math.round((next.getTime() - now.getTime()) / 60_000)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const nextDay = new Date(next)
  nextDay.setHours(0, 0, 0, 0)

  const timeLabel = next.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (minutesUntil <= 0) {
    const dayLabel = nextDay.getTime() === today.getTime() ? 'Today' : 'Tomorrow'
    return `${dayLabel} at ${timeLabel}`
  }

  if (minutesUntil > 0 && minutesUntil <= 180) {
    return `in ${minutesUntil} min (${timeLabel})`
  }

  const dayLabel = nextDay.getTime() === today.getTime() ? 'Today' : 'Tomorrow'
  return `${dayLabel} at ${timeLabel}`
}

export function getReminderScheduleAt(time: string, now: Date = new Date()): Date {
  const next = getNextReminderFireDate(time, now)
  const delayMs = next.getTime() - now.getTime()
  const minimumDelayMs = 30_000

  return new Date(now.getTime() + Math.max(delayMs, minimumDelayMs))
}

export function formatReminderTimeLabel(time: string): string {
  const parsed = parseReminderTime(time)
  if (!parsed) return time

  const date = new Date()
  date.setHours(parsed.hour, parsed.minute, 0, 0)

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
