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
  toggleHabitCompleted,
  updateHabit,
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
    const updated = updateHabit(habit.id, { title: 'Morning walk', icon: '🌅' })

    expect(updated?.title).toBe('Morning walk')
    expect(getActiveHabits()[0].icon).toBe('🌅')
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
    const second = addHabit({ title: 'Two', icon: '2️⃣' })
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
