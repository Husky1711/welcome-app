import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_HABITS } from '../constants/habits'
import {
  addHabit,
  archiveHabit,
  clearStoredHabits,
  getActiveHabits,
  getArchivedHabits,
  isHabitCompletedOnDate,
  setHabitCompleted,
  setHabitReminderEnabled,
  toggleHabitCompleted,
  updateHabit,
  getTargetsForHabit,
  getActiveTarget,
  supersedeTarget,
  ensureHabitTargetMigration,
} from './habitStorage'
import { getCurrentStreak, getDayProgress, getDayStatus } from './habitStats'
import { addDaysToDate, canEditHabitDate, formatLocalDate } from './dateUtils'

describe('habitStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds and lists active habits', () => {
    addHabit({ title: 'Meditate', icon: '🧘' })
    const habits = getActiveHabits()

    expect(habits).toHaveLength(1)
    expect(habits[0].title).toBe('Meditate')
    expect(habits[0].isArchived).toBe(false)
  })

  it('archives habits instead of deleting them', () => {
    const habit = addHabit({ title: 'Read', icon: '📖' })
    archiveHabit(habit.id)

    expect(getActiveHabits()).toHaveLength(0)
    expect(getArchivedHabits()).toHaveLength(1)
  })

  it('updates an active habit', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const updated = updateHabit(habit.id, {
      title: 'Morning walk',
      icon: '🌅',
      reminderEnabled: true,
      reminderTime: '07:00',
    })

    expect(updated?.title).toBe('Morning walk')
    expect(getActiveHabits()[0].reminderEnabled).toBe(true)
    expect(getActiveHabits()[0].reminderTime).toBe('07:00')
  })

  it('disables reminders when archiving', () => {
    const habit = addHabit({
      title: 'Journal',
      icon: '📝',
      reminderEnabled: true,
      reminderTime: '21:00',
    })

    archiveHabit(habit.id)

    expect(getArchivedHabits()[0].reminderEnabled).toBe(false)
  })

  it('can toggle reminder enabled without changing other fields', () => {
    const habit = addHabit({
      title: 'Stretch',
      icon: '🧘',
      reminderEnabled: true,
      reminderTime: '08:30',
    })

    const updated = setHabitReminderEnabled(habit.id, false)

    expect(updated?.reminderEnabled).toBe(false)
    expect(getActiveHabits()[0].reminderTime).toBe('08:30')
    expect(getActiveHabits()[0].title).toBe('Stretch')
  })

  it('toggles completion for a date', () => {
    const habit = addHabit({ title: 'Workout', icon: '💪' })
    const today = formatLocalDate()

    expect(toggleHabitCompleted(habit.id, today)).toBe(true)
    expect(isHabitCompletedOnDate(habit.id, today)).toBe(true)

    expect(toggleHabitCompleted(habit.id, today)).toBe(false)
    expect(isHabitCompletedOnDate(habit.id, today)).toBe(false)
  })

  it('enforces the max habit limit', () => {
    for (let index = 0; index < MAX_HABITS; index += 1) {
      addHabit({ title: `Habit ${index + 1}`, icon: '✅' })
    }

    expect(() => addHabit({ title: 'Too many', icon: '❌' })).toThrow(
      `You can track up to ${MAX_HABITS} habits.`,
    )
  })

  it('clears habits and logs', () => {
    const habit = addHabit({ title: 'Journal', icon: '📝' })
    setHabitCompleted(habit.id, formatLocalDate(), true)

    clearStoredHabits()

    expect(getActiveHabits()).toHaveLength(0)
    expect(isHabitCompletedOnDate(habit.id, formatLocalDate())).toBe(false)
  })
})

describe('habitStats', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('calculates day progress', () => {
    const first = addHabit({ title: 'One', icon: '1️⃣' })
    addHabit({ title: 'Two', icon: '2️⃣' })
    const today = formatLocalDate()

    setHabitCompleted(first.id, today, true)

    expect(getDayProgress(today)).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
    })
  })

  it('calculates current streak', () => {
    const habit = addHabit({ title: 'Daily', icon: '🔥' })
    const today = formatLocalDate()

    setHabitCompleted(habit.id, today, true)

    expect(getCurrentStreak(habit.id, today)).toBe(1)
  })

  it('reports day status for calendar dots', () => {
    const habit = addHabit({ title: 'Daily', icon: '🔥' })
    const today = formatLocalDate()

    expect(getDayStatus(today)).toBe('none')

    setHabitCompleted(habit.id, today, true)
    expect(getDayStatus(today)).toBe('full')
  })
})

describe('dateUtils', () => {
  it('allows editing within the past 7 days only', () => {
    const today = formatLocalDate()
    const sevenDaysAgo = addDaysToDate(today, -7)
    const eightDaysAgo = addDaysToDate(today, -8)

    expect(canEditHabitDate(today)).toBe(true)
    expect(canEditHabitDate(sevenDaysAgo)).toBe(true)
    expect(canEditHabitDate(eightDaysAgo)).toBe(false)
  })
})

describe('habitStorage targets', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('automatically creates a default target when adding a habit', () => {
    const habit = addHabit({ title: 'Meditate', icon: '🧘' })
    const targets = getTargetsForHabit(habit.id)

    expect(targets).toHaveLength(1)
    expect(targets[0].period).toBe('daily')
    expect(targets[0].targetFrequency).toBe(1)
    expect(targets[0].endDate).toBeNull()
  })

  it('runs ensureHabitTargetMigration to backfill targets for existing habits', () => {
    const habitId = 'pre-existing-habit-id'
    const habit = {
      id: habitId,
      title: 'Legacy Habit',
      icon: '👴',
      reminderEnabled: false,
      reminderTime: '12:00',
      sortOrder: 0,
      isArchived: false,
      createdAt: '2026-07-10T12:00:00.000Z',
    }
    localStorage.setItem('welcome_app_habits', JSON.stringify([habit]))

    ensureHabitTargetMigration()

    const targets = getTargetsForHabit(habitId)
    expect(targets).toHaveLength(1)
    expect(targets[0].period).toBe('daily')
    expect(targets[0].targetFrequency).toBe(1)
    expect(targets[0].startDate).toBe('2026-07-10')
    expect(targets[0].endDate).toBeNull()
  })

  it('supersedes target with yesterday end date for old contract and today start date for new', () => {
    const habit = addHabit({ title: 'Exercise', icon: '💪' })
    const today = formatLocalDate()
    const yesterday = addDaysToDate(today, -1)

    const targetsInfo = getTargetsForHabit(habit.id)
    targetsInfo[0].startDate = yesterday
    localStorage.setItem('welcome_app_habit_targets', JSON.stringify(targetsInfo))

    supersedeTarget(habit.id, 'weekly', 4, today)

    const updatedTargets = getTargetsForHabit(habit.id)
    expect(updatedTargets).toHaveLength(2)

    const closed = updatedTargets.find((t) => t.endDate !== null)
    expect(closed).toBeDefined()
    expect(closed?.endDate).toBe(yesterday)
    expect(closed?.period).toBe('daily')

    const active = updatedTargets.find((t) => t.endDate === null)
    expect(active).toBeDefined()
    expect(active?.startDate).toBe(today)
    expect(active?.period).toBe('weekly')
    expect(active?.targetFrequency).toBe(4)
  })

  it('updates the active target inline if same-day re-edit is performed', () => {
    const habit = addHabit({ title: 'Write Blog', icon: '📝' })
    const today = formatLocalDate()
    const yesterday = addDaysToDate(today, -1)

    // Force default target's startDate to yesterday for this test
    const targetsInfo = getTargetsForHabit(habit.id)
    targetsInfo[0].startDate = yesterday
    localStorage.setItem('welcome_app_habit_targets', JSON.stringify(targetsInfo))

    // First edit today: closes yesterday, opens today (length becomes 2)
    supersedeTarget(habit.id, 'weekly', 3, today)
    // Second edit today: mutates the target created today (length should STILL be 2)
    supersedeTarget(habit.id, 'weekly', 5, today)

    const targets = getTargetsForHabit(habit.id)
    expect(targets).toHaveLength(2) // 1 default (closed) + 1 active (mutated today)

    const active = targets.find((t) => t.endDate === null)
    expect(active?.targetFrequency).toBe(5)
  })

  it('enforces frequency boundaries (daily always 1, weekly clamps 1-7)', () => {
    const habit = addHabit({ title: 'Frequency Test', icon: '🧪' })
    const today = formatLocalDate()

    const dailyTarget = supersedeTarget(habit.id, 'daily', 5, today)
    expect(dailyTarget.targetFrequency).toBe(1)

    const weeklyMin = supersedeTarget(habit.id, 'weekly', 0, today)
    expect(weeklyMin.targetFrequency).toBe(1)

    const weeklyMax = supersedeTarget(habit.id, 'weekly', 10, today)
    expect(weeklyMax.targetFrequency).toBe(7)
  })

  it('retrieves active targets for current or historical dates correctly', () => {
    const habit = addHabit({ title: 'History Test', icon: '🕰️' })
    const today = formatLocalDate()
    const yesterday = addDaysToDate(today, -1)
    const twoDaysAgo = addDaysToDate(today, -2)

    const targets = [
      {
        id: 't1',
        habitId: habit.id,
        period: 'daily' as const,
        targetFrequency: 1,
        startDate: twoDaysAgo,
        endDate: yesterday,
      },
      {
        id: 't2',
        habitId: habit.id,
        period: 'weekly' as const,
        targetFrequency: 3,
        startDate: today,
        endDate: null,
      },
    ]
    localStorage.setItem('welcome_app_habit_targets', JSON.stringify(targets))

    expect(getActiveTarget(habit.id, twoDaysAgo)?.period).toBe('daily')
    expect(getActiveTarget(habit.id, yesterday)?.period).toBe('daily')
    expect(getActiveTarget(habit.id, today)?.period).toBe('weekly')
    expect(getActiveTarget(habit.id, addDaysToDate(twoDaysAgo, -1))).toBeNull()
  })
})
