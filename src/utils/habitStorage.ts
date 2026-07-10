import { DEFAULT_REMINDER_TIME, MAX_HABITS } from '../constants/habits'
import { STORAGE_KEYS } from '../constants/auth'
import type { Habit, HabitInput, HabitLog } from '../types/habit'

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
    reminderTime: input.reminderTime ?? DEFAULT_REMINDER_TIME,
    sortOrder: habits.length,
    isArchived: false,
    createdAt: new Date().toISOString(),
  }

  saveHabits([...habits, habit])
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
    reminderTime: input.reminderTime ?? habits[index].reminderTime,
  }

  habits[index] = updated
  saveHabits(habits)
  return updated
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
}
