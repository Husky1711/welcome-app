import { beforeEach, describe, expect, it } from 'vitest'
import { ensureConsistencyHistorySeed } from './consistencySeed'
import { addDaysToDate, formatLocalDate, getCycleWindow } from './dateUtils'
import { getStoryInsights } from './habitInsights'
import { addHabit, isHabitCompletedOnDate, setHabitCompleted } from './habitStorage'

describe('ensureConsistencyHistorySeed', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('seeds past weeks so the consistency map has activity', () => {
    addHabit({ title: 'Walk', icon: '🏃' })
    addHabit({ title: 'Read', icon: '📖' })
    const today = formatLocalDate()

    const seeded = ensureConsistencyHistorySeed(today)
    expect(seeded).toBe(true)

    const story = getStoryInsights('this-week', today)
    const filled = story.consistencyWeeks
      .flatMap((week) => week.days)
      .filter((cell) => !cell.isFuture && cell.level > 0)

    expect(filled.length).toBeGreaterThan(5)
    expect(ensureConsistencyHistorySeed(today)).toBe(false)
  })

  it('does not invent history when enough past logs already exist', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const today = formatLocalDate()
    const { start } = getCycleWindow(today, 'weekly')

    for (let i = 1; i <= 12; i += 1) {
      setHabitCompleted(habit.id, addDaysToDate(start, -i), true)
    }

    expect(ensureConsistencyHistorySeed(today)).toBe(false)
    expect(isHabitCompletedOnDate(habit.id, addDaysToDate(start, -3))).toBe(true)
  })

  it('backfills when past history is too sparse for a readable map', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const today = formatLocalDate()
    const { start } = getCycleWindow(today, 'weekly')
    setHabitCompleted(habit.id, addDaysToDate(start, -3), true)

    expect(ensureConsistencyHistorySeed(today)).toBe(true)

    const story = getStoryInsights('this-week', today)
    const filled = story.consistencyWeeks
      .flatMap((week) => week.days)
      .filter((cell) => !cell.isFuture && cell.level > 0)

    expect(filled.length).toBeGreaterThan(5)
  })
})
