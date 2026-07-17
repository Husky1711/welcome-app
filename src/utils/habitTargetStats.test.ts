import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../constants/auth'
import {
  addHabit,
  ensureHabitTargetMigration,
  getTargetsForHabit,
  setHabitCompleted,
  supersedeTarget,
} from './habitStorage'
import { addDaysToDate, formatLocalDate, getCycleWindow } from './dateUtils'
import {
  getCurrentCycleStreak,
  getHabitCycleProgress,
  getOnTrackProgress,
  getWeekDayPulses,
  getWeeklyGoalsForWeek,
} from './habitTargetStats'

describe('getCycleWindow', () => {
  it('returns the same day for daily', () => {
    expect(getCycleWindow('2026-07-15', 'daily')).toEqual({
      start: '2026-07-15',
      end: '2026-07-15',
    })
  })

  it('returns Mon–Sun ISO week for weekly', () => {
    // 2026-07-15 is Wednesday
    expect(getCycleWindow('2026-07-15', 'weekly')).toEqual({
      start: '2026-07-13',
      end: '2026-07-19',
    })
  })
})

describe('habitTargetStats', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('counts weekly progress inside the ISO week only', () => {
    const habit = addHabit({ title: 'Spanish', icon: '📖' })
    const today = formatLocalDate()
    supersedeTarget(habit.id, 'weekly', 3, today)

    const week = getCycleWindow(today, 'weekly')
    setHabitCompleted(habit.id, week.start, true)
    setHabitCompleted(habit.id, addDaysToDate(week.start, 1), true)
    setHabitCompleted(habit.id, addDaysToDate(week.start, -1), true)

    const progress = getHabitCycleProgress(habit.id, today)
    expect(progress?.completed).toBe(2)
    expect(progress?.target).toBe(3)
    expect(progress?.onTrack).toBe(false)
  })

  it('marks weekly habit on track once frequency is met', () => {
    const habit = addHabit({ title: 'Workout', icon: '💪' })
    const today = formatLocalDate()
    supersedeTarget(habit.id, 'weekly', 2, today)

    const week = getCycleWindow(today, 'weekly')
    setHabitCompleted(habit.id, week.start, true)
    setHabitCompleted(habit.id, addDaysToDate(week.start, 2), true)

    expect(getHabitCycleProgress(habit.id, today)?.onTrack).toBe(true)
    expect(getOnTrackProgress(today).onTrack).toBe(1)
  })

  it('builds week day pulses and weekly goals', () => {
    const habit = addHabit({ title: 'Spanish', icon: '📖' })
    const today = formatLocalDate()
    supersedeTarget(habit.id, 'weekly', 3, today)
    setHabitCompleted(habit.id, today, true)

    const pulses = getWeekDayPulses(today, today, today)
    expect(pulses).toHaveLength(7)
    expect(pulses[0].label).toBe('Mon')

    const goals = getWeeklyGoalsForWeek(today)
    expect(goals).toHaveLength(1)
    expect(goals[0].progress.completed).toBe(1)
  })

  it('starts a new streak series when period changes', () => {
    const habit = addHabit({ title: 'Meditate', icon: '🧘' })
    const today = formatLocalDate()
    const d0 = addDaysToDate(today, -2)
    const d1 = addDaysToDate(today, -1)

    const targets = getTargetsForHabit(habit.id)
    targets[0].startDate = d0
    localStorage.setItem(STORAGE_KEYS.HABIT_TARGETS, JSON.stringify(targets))

    setHabitCompleted(habit.id, d0, true)
    setHabitCompleted(habit.id, d1, true)
    setHabitCompleted(habit.id, today, true)
    expect(getCurrentCycleStreak(habit.id, today)).toBe(3)

    // Frequency above current week logs → new weekly series has not met a cycle yet
    supersedeTarget(habit.id, 'weekly', 5, today)
    expect(getCurrentCycleStreak(habit.id, today)).toBe(0)

    // Meeting the new weekly goal starts a fresh weekly streak at 1 (not 3)
    supersedeTarget(habit.id, 'weekly', 3, today)
    expect(getCurrentCycleStreak(habit.id, today)).toBe(1)
  })

  it('backfills missing targets even when the targets key already exists', () => {
    localStorage.setItem(STORAGE_KEYS.HABIT_TARGETS, '[]')
    localStorage.setItem(
      STORAGE_KEYS.HABITS,
      JSON.stringify([
        {
          id: 'habit-1',
          title: 'Read',
          icon: '📖',
          reminderEnabled: false,
          reminderTime: '08:00',
          sortOrder: 0,
          isArchived: false,
          createdAt: '2026-07-10T12:00:00.000Z',
        },
      ]),
    )

    ensureHabitTargetMigration()

    expect(getTargetsForHabit('habit-1')).toHaveLength(1)
    ensureHabitTargetMigration()
    expect(getTargetsForHabit('habit-1')).toHaveLength(1)
  })
})
