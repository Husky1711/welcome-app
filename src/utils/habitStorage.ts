import { DEFAULT_REMINDER_TIME, MAX_HABITS } from '../constants/habits'
import { STORAGE_KEYS } from '../constants/auth'
import type { Habit, HabitInput, HabitLog, HabitTarget, TargetPeriod } from '../types/habit'
import { normalizeReminderTime } from './reminderTime'
import { addDaysToDate, formatLocalDate } from './dateUtils'

function resolveReminderTime(time?: string): string {
  return normalizeReminderTime(time ?? DEFAULT_REMINDER_TIME) ?? DEFAULT_REMINDER_TIME
}

function generateId(): string {
  return crypto.randomUUID()
}

function getStoredHabitsRaw(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS)
    if (!raw) return []

    const parsed = JSON.parse(raw) as Habit[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (habit) =>
        typeof habit.id === 'string' &&
        typeof habit.title === 'string' &&
        typeof habit.icon === 'string',
    )
  } catch {
    return []
  }
}

function saveHabits(habits: Habit[]): void {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits))
}

function getStoredLogsRaw(): HabitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS)
    if (!raw) return []

    const parsed = JSON.parse(raw) as HabitLog[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (log) =>
        typeof log.id === 'string' &&
        typeof log.habitId === 'string' &&
        typeof log.date === 'string',
    )
  } catch {
    return []
  }
}

function saveLogs(logs: HabitLog[]): void {
  localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs))
}

export function getActiveHabits(): Habit[] {
  return getStoredHabitsRaw()
    .filter((habit) => !habit.isArchived)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getAllHabits(): Habit[] {
  return getStoredHabitsRaw().sort((a, b) => a.sortOrder - b.sortOrder)
}

export function addHabit(input: HabitInput): Habit {
  const active = getActiveHabits()
  if (active.length >= MAX_HABITS) {
    throw new Error(`You can track up to ${MAX_HABITS} habits.`)
  }

  const habits = getStoredHabitsRaw()
  const id = generateId()
  const habit: Habit = {
    id,
    title: input.title.trim(),
    icon: input.icon.trim() || '✅',
    reminderEnabled: input.reminderEnabled ?? false,
    reminderTime: resolveReminderTime(input.reminderTime),
    sortOrder: habits.length,
    isArchived: false,
    createdAt: new Date().toISOString(),
  }

  saveHabits([...habits, habit])
  createDefaultTarget(habit)
  return habit
}

export function archiveHabit(id: string): boolean {
  const habits = getStoredHabitsRaw()
  const index = habits.findIndex((habit) => habit.id === id)
  if (index === -1) return false

  habits[index] = { ...habits[index], isArchived: true, reminderEnabled: false }
  saveHabits(habits)
  return true
}

export function updateHabit(id: string, input: HabitInput): Habit | null {
  const habits = getStoredHabitsRaw()
  const index = habits.findIndex((habit) => habit.id === id)
  if (index === -1 || habits[index].isArchived) return null

  const updated: Habit = {
    ...habits[index],
    title: input.title.trim(),
    icon: input.icon.trim() || '✅',
    reminderEnabled: input.reminderEnabled ?? habits[index].reminderEnabled,
    reminderTime: resolveReminderTime(input.reminderTime ?? habits[index].reminderTime),
  }

  habits[index] = updated
  saveHabits(habits)
  return updated
}

export function setHabitReminderEnabled(id: string, enabled: boolean): Habit | null {
  const habits = getStoredHabitsRaw()
  const index = habits.findIndex((habit) => habit.id === id)
  if (index === -1 || habits[index].isArchived) return null

  habits[index] = { ...habits[index], reminderEnabled: enabled }
  saveHabits(habits)
  return habits[index]
}

export function getArchivedHabits(): Habit[] {
  return getStoredHabitsRaw()
    .filter((habit) => habit.isArchived)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getLogsForDate(date: string): HabitLog[] {
  return getStoredLogsRaw().filter((log) => log.date === date && log.completed)
}

export function isHabitCompletedOnDate(habitId: string, date: string): boolean {
  return getStoredLogsRaw().some(
    (log) => log.habitId === habitId && log.date === date && log.completed,
  )
}

export function countCompletedLogsInRange(
  habitId: string,
  startDate: string,
  endDate: string,
): number {
  return getStoredLogsRaw().filter(
    (log) =>
      log.habitId === habitId &&
      log.completed &&
      log.date >= startDate &&
      log.date <= endDate,
  ).length
}

export function setHabitCompleted(
  habitId: string,
  date: string,
  completed: boolean,
): HabitLog | null {
  const logs = getStoredLogsRaw()
  const index = logs.findIndex((log) => log.habitId === habitId && log.date === date)

  if (completed) {
    if (index !== -1) {
      const updated: HabitLog = {
        ...logs[index],
        completed: true,
        completedAt: new Date().toISOString(),
      }
      logs[index] = updated
      saveLogs(logs)
      return updated
    }

    const log: HabitLog = {
      id: generateId(),
      habitId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
    }
    saveLogs([...logs, log])
    return log
  }

  if (index === -1) return null

  const filtered = logs.filter((log) => !(log.habitId === habitId && log.date === date))
  saveLogs(filtered)
  return null
}

export function toggleHabitCompleted(habitId: string, date: string): boolean {
  const completed = isHabitCompletedOnDate(habitId, date)
  setHabitCompleted(habitId, date, !completed)
  return !completed
}

export function clearStoredHabits(): void {
  localStorage.removeItem(STORAGE_KEYS.HABITS)
  localStorage.removeItem(STORAGE_KEYS.HABIT_LOGS)
  localStorage.removeItem(STORAGE_KEYS.HABIT_TARGETS)
}

// Target versioning, storage APIs, and backfill migration
function getStoredTargetsRaw(): HabitTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_TARGETS)
    if (!raw) return []

    const parsed = JSON.parse(raw) as HabitTarget[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (target) =>
        typeof target.id === 'string' &&
        typeof target.habitId === 'string' &&
        (target.period === 'daily' || target.period === 'weekly') &&
        typeof target.targetFrequency === 'number' &&
        typeof target.startDate === 'string' &&
        (target.endDate === null || typeof target.endDate === 'string'),
    )
  } catch {
    return []
  }
}

function saveTargets(targets: HabitTarget[]): void {
  localStorage.setItem(STORAGE_KEYS.HABIT_TARGETS, JSON.stringify(targets))
}

export function getTargetsForHabit(habitId: string): HabitTarget[] {
  return getStoredTargetsRaw().filter((target) => target.habitId === habitId)
}

export function getActiveTarget(
  habitId: string,
  dateStr: string = formatLocalDate(),
): HabitTarget | null {
  return getTargetForDate(habitId, dateStr)
}

export function getTargetForDate(habitId: string, dateStr: string): HabitTarget | null {
  const targets = getTargetsForHabit(habitId)
  return (
    targets.find(
      (target) =>
        target.startDate <= dateStr &&
        (target.endDate === null || dateStr <= target.endDate),
    ) || null
  )
}

export function createDefaultTarget(habit: Habit, startDateStr?: string): HabitTarget {
  const existingActive = getActiveTarget(habit.id, startDateStr ?? formatLocalDate())
  if (existingActive) {
    return existingActive
  }

  const startDate = startDateStr ?? formatLocalDate(new Date(habit.createdAt))
  const newTarget: HabitTarget = {
    id: generateId(),
    habitId: habit.id,
    period: 'daily',
    targetFrequency: 1,
    startDate,
    endDate: null,
  }
  const targets = getStoredTargetsRaw()
  saveTargets([...targets, newTarget])
  return newTarget
}

export function supersedeTarget(
  habitId: string,
  period: TargetPeriod,
  targetFrequency: number,
  dateStr: string = formatLocalDate(),
): HabitTarget {
  const targetPeriod: TargetPeriod = period === 'daily' ? 'daily' : 'weekly'
  let frequency = Math.floor(targetFrequency)
  if (targetPeriod === 'daily') {
    frequency = 1
  } else {
    frequency = Math.max(1, Math.min(7, frequency))
  }

  const targets = getStoredTargetsRaw()
  const activeTargetIndex = targets.findIndex(
    (t) => t.habitId === habitId && t.endDate === null,
  )

  // 1. Same-day re-edit rule: mutate active target in place if starts today
  if (activeTargetIndex !== -1 && targets[activeTargetIndex].startDate === dateStr) {
    targets[activeTargetIndex] = {
      ...targets[activeTargetIndex],
      period: targetPeriod,
      targetFrequency: frequency,
    }
    saveTargets(targets)
    return targets[activeTargetIndex]
  }

  // 2. Otherwise: close active target as of yesterday, open new target starting today
  if (activeTargetIndex !== -1) {
    const activeTarget = targets[activeTargetIndex]
    const yesterday = addDaysToDate(dateStr, -1)
    targets[activeTargetIndex] = {
      ...activeTarget,
      endDate: yesterday,
    }
  }

  const newTarget: HabitTarget = {
    id: generateId(),
    habitId,
    period: targetPeriod,
    targetFrequency: frequency,
    startDate: dateStr,
    endDate: null,
  }

  saveTargets([...targets, newTarget])
  return newTarget
}

export function ensureHabitTargetMigration(): void {
  const habits = getStoredHabitsRaw()
  if (habits.length === 0) {
    if (localStorage.getItem(STORAGE_KEYS.HABIT_TARGETS) === null) {
      saveTargets([])
    }
    return
  }

  const targets = getStoredTargetsRaw()
  const habitIdsWithTarget = new Set(targets.map((target) => target.habitId))
  const missing = habits.filter((habit) => !habitIdsWithTarget.has(habit.id))

  if (missing.length === 0) {
    if (localStorage.getItem(STORAGE_KEYS.HABIT_TARGETS) === null) {
      saveTargets(targets)
    }
    return
  }

  const backfill: HabitTarget[] = missing.map((habit) => ({
    id: generateId(),
    habitId: habit.id,
    period: 'daily' as const,
    targetFrequency: 1,
    startDate: formatLocalDate(new Date(habit.createdAt)),
    endDate: null,
  }))

  saveTargets([...targets, ...backfill])
}
