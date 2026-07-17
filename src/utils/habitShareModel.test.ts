import { beforeEach, describe, expect, it } from 'vitest'
import { addHabit, clearStoredHabits, setHabitCompleted } from './habitStorage'
import { addDaysToDate, formatLocalDate } from './dateUtils'
import { buildHabitShareModel } from './habitShareModel'

describe('buildHabitShareModel', () => {
  beforeEach(() => {
    localStorage.clear()
    clearStoredHabits()
  })

  it('builds streak headline and last-7 dots', () => {
    const habit = addHabit({ title: 'Meditate', icon: '🧘' })
    const today = formatLocalDate()

    for (let i = 0; i < 5; i += 1) {
      setHabitCompleted(habit.id, addDaysToDate(today, -i), true)
    }

    const model = buildHabitShareModel(habit, today)

    expect(model.streak).toBe(5)
    expect(model.completedInLast7).toBe(5)
    expect(model.headline).toBe('5-day streak')
    expect(model.last7).toEqual([false, false, true, true, true, true, true])
    expect(model.canShare).toBe(true)
    expect(model.shareText).toContain('Welcome')
  })

  it('uses last-7 headline when streak is zero but recent completions exist', () => {
    const habit = addHabit({ title: 'Water', icon: '💧' })
    const today = formatLocalDate()

    setHabitCompleted(habit.id, addDaysToDate(today, -2), true)
    setHabitCompleted(habit.id, addDaysToDate(today, -4), true)

    const model = buildHabitShareModel(habit, today)

    expect(model.streak).toBe(0)
    expect(model.completedInLast7).toBe(2)
    expect(model.headline).toBe('2 of last 7')
    expect(model.canShare).toBe(true)
  })

  it('blocks share when there is nothing to celebrate', () => {
    const habit = addHabit({ title: 'Read', icon: '📖' })
    const model = buildHabitShareModel(habit)

    expect(model.canShare).toBe(false)
    expect(model.headline).toBe('0 of last 7')
  })
})
