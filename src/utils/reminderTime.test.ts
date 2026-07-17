import { describe, expect, it } from 'vitest'
import {
  formatReminderTimeLabel,
  getNextReminderFireDate,
  getReminderScheduleAt,
  getSuggestedReminderTime,
  hasReminderTimePassedToday,
  normalizeReminderTime,
  parseReminderTime,
} from './reminderTime'

describe('reminderTime', () => {
  it('parses valid reminder times', () => {
    expect(parseReminderTime('08:00')).toEqual({ hour: 8, minute: 0 })
    expect(parseReminderTime('21:30')).toEqual({ hour: 21, minute: 30 })
  })

  it('rejects invalid reminder times', () => {
    expect(parseReminderTime('24:00')).toBeNull()
    expect(parseReminderTime('bad')).toBeNull()
  })

  it('normalizes reminder times from the Android time picker', () => {
    expect(normalizeReminderTime('7:05')).toBe('07:05')
    expect(normalizeReminderTime('19:16:00')).toBe('19:16')
  })

  it('schedules next reminder for tomorrow when time already passed today', () => {
    const now = new Date('2026-07-11T18:30:00')
    const next = getNextReminderFireDate('08:00', now)

    expect(next.getDate()).toBe(12)
    expect(next.getHours()).toBe(8)
    expect(next.getMinutes()).toBe(0)
  })

  it('schedules next reminder for later today when time is still ahead', () => {
    const now = new Date('2026-07-11T18:30:00')
    const next = getNextReminderFireDate('20:00', now)

    expect(next.getDate()).toBe(11)
    expect(next.getHours()).toBe(20)
  })

  it('builds schedule dates from now plus delay like the test notification', () => {
    const now = new Date('2026-07-11T18:30:00')
    const scheduleAt = getReminderScheduleAt('18:33', now)

    expect(scheduleAt.getTime() - now.getTime()).toBe(3 * 60 * 1000)
  })

  it('formats reminder labels from 24h time', () => {
    expect(formatReminderTimeLabel('08:00')).toMatch(/8/)
  })

  it('suggests a reminder time a few minutes ahead', () => {
    const now = new Date('2026-07-11T18:30:00')
    expect(getSuggestedReminderTime(now, 3)).toBe('18:33')
  })

  it('detects when a reminder time already passed today', () => {
    const now = new Date('2026-07-11T19:49:00')
    expect(hasReminderTimePassedToday('19:48', now)).toBe(true)
    expect(hasReminderTimePassedToday('20:00', now)).toBe(false)
  })
})
