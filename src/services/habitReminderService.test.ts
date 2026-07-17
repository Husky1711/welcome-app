import { describe, expect, it } from 'vitest'
import { getHabitNotificationId } from './habitReminderService'

describe('habitReminderService', () => {
  it('creates stable notification ids per habit', () => {
    const first = getHabitNotificationId('habit-abc')
    const second = getHabitNotificationId('habit-abc')
    const other = getHabitNotificationId('habit-xyz')

    expect(first).toBe(second)
    expect(first).not.toBe(other)
    expect(first).toBeGreaterThanOrEqual(1000)
  })
})
