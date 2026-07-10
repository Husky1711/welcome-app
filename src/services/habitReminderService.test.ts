import { describe, expect, it } from 'vitest'
import {
  formatReminderTimeLabel,
  getHabitNotificationId,
  parseReminderTime,
} from './habitReminderService'

describe('habitReminderService', () => {
  it('parses valid reminder times', () => {
    expect(parseReminderTime('08:00')).toEqual({ hour: 8, minute: 0 })
    expect(parseReminderTime('21:30')).toEqual({ hour: 21, minute: 30 })
  })

  it('rejects invalid reminder times', () => {
    expect(parseReminderTime('24:00')).toBeNull()
    expect(parseReminderTime('8:00')).toBeNull()
    expect(parseReminderTime('bad')).toBeNull()
  })

  it('creates stable notification ids per habit', () => {
    const first = getHabitNotificationId('habit-abc')
    const second = getHabitNotificationId('habit-abc')
    const other = getHabitNotificationId('habit-xyz')

    expect(first).toBe(second)
    expect(first).not.toBe(other)
    expect(first).toBeGreaterThanOrEqual(1000)
  })

  it('formats reminder labels from 24h time', () => {
    expect(formatReminderTimeLabel('08:00')).toMatch(/8/)
  })
})
