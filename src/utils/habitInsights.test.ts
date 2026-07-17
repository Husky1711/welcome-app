import { beforeEach, describe, expect, it } from 'vitest'
import { addHabit, setHabitCompleted, supersedeTarget } from './habitStorage'
import { formatLocalDate, getCycleWindow } from './dateUtils'
import {
  getInsightsForDay,
  getInsightsForMonth,
  getInsightsForWeek,
  getStoryInsights,
} from './habitInsights'

describe('habitInsights', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('summarizes a day of logs', () => {
    const habit = addHabit({ title: 'Read', icon: '📖' })
    const today = formatLocalDate()
    setHabitCompleted(habit.id, today, true)

    const insights = getInsightsForDay(today)
    expect(insights.headlineValue).toBe('1/1')
    expect(insights.habits[0].status).toBe('met')
  })

  it('summarizes weekly on-track progress', () => {
    const habit = addHabit({ title: 'Spanish', icon: '📖' })
    const today = formatLocalDate()
    supersedeTarget(habit.id, 'weekly', 2, today)
    const week = getCycleWindow(today, 'weekly')
    setHabitCompleted(habit.id, week.start, true)
    setHabitCompleted(habit.id, today, true)

    const insights = getInsightsForWeek(today)
    expect(insights.mode).toBe('week')
    expect(insights.headlineValue).toBe('1/1')
    expect(insights.habits[0].status).toBe('met')
    expect(insights.bars).toHaveLength(7)
  })

  it('summarizes month logged days', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const today = formatLocalDate()
    const [year, month] = today.split('-').map(Number)
    setHabitCompleted(habit.id, today, true)

    const insights = getInsightsForMonth(year, month - 1)
    expect(insights.mode).toBe('month')
    expect(insights.headlineValue).toMatch(/1\//)
    expect(insights.empty).toBe(false)
    expect(insights.bars).toHaveLength(0)
    expect(insights.progressPercent).toBeTypeOf('number')
  })

  it('builds story overview with consistency map', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const today = formatLocalDate()
    setHabitCompleted(habit.id, today, true)

    const story = getStoryInsights('this-week', today)
    expect(story.total).toBe(1)
    expect(story.completionsDone).toBeGreaterThanOrEqual(1)
    expect(story.completionsTotal).toBeGreaterThan(0)
    expect(story.performancePercent).toBe(
      Math.round((story.completionsDone / story.completionsTotal) * 100),
    )
    expect(story.summaryLabel).toMatch(/Summary for/i)
    expect(story.consistencyWeeks).toHaveLength(5)
    expect(story.consistencyWeeks[0].days).toHaveLength(7)
    expect(story.habits[0].title).toBe('Walk')
  })

  it('switches story range to last week and last month', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    const today = formatLocalDate()
    setHabitCompleted(habit.id, today, true)

    const lastWeek = getStoryInsights('last-week', today)
    expect(lastWeek.range).toBe('last-week')
    expect(lastWeek.summaryLabel).toBe('Summary for last week')
    expect(lastWeek.habits[0].title).toBe('Walk')

    const lastMonth = getStoryInsights('last-month', today)
    expect(lastMonth.range).toBe('last-month')
    expect(lastMonth.habits).toHaveLength(1)
  })
})
