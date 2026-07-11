import { describe, expect, it } from 'vitest'
import { getHabitReminderIconPrefix, isHabitIconImage } from './habitIcon'

describe('habitIcon', () => {
  it('detects image data URLs', () => {
    expect(isHabitIconImage('data:image/jpeg;base64,abc')).toBe(true)
    expect(isHabitIconImage('🧘')).toBe(false)
  })

  it('uses a bell prefix for custom image icons in reminders', () => {
    expect(getHabitReminderIconPrefix('data:image/jpeg;base64,abc')).toBe('🔔')
    expect(getHabitReminderIconPrefix('💧')).toBe('💧')
  })
})
