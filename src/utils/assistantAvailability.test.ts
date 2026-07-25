import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAssistantAvailability } from './assistantAvailability'
import {
  acceptAssistantConsent,
  assistantOwnerKey,
  clearAllAssistantConsent,
} from './assistantConsentStorage'
import { buildAssistantContext } from './assistantContext'
import { addHabit, setHabitCompleted } from './habitStorage'
import { classifyClientSafety } from '../services/assistantChatService'

vi.mock('../services/auth/getAuthService', () => ({
  getAuthProvider: vi.fn(() => 'firebase'),
}))

import { getAuthProvider } from '../services/auth/getAuthService'

describe('assistant foundation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(getAuthProvider).mockReturnValue('firebase')
  })

  it('blocks Coach under mock authentication', () => {
    vi.mocked(getAuthProvider).mockReturnValue('mock')
    expect(
      getAssistantAvailability({ email: 'a@example.com', displayName: 'A', uid: 'u1' }),
    ).toBe('unavailable_mock_auth')
  })

  it('requires consent then becomes ready', () => {
    const user = { email: 'a@example.com', displayName: 'A', uid: 'u1' }
    expect(getAssistantAvailability(user)).toBe('needs_consent')
    acceptAssistantConsent(assistantOwnerKey(user.uid, user.email), '2026-07-25T10:00:00.000Z')
    expect(getAssistantAvailability(user)).toBe('ready')
  })

  it('limits context to post-activation completions', () => {
    const habit = addHabit({ title: 'Walk', icon: '🏃' })
    setHabitCompleted(habit.id, '2026-07-20', true)
    setHabitCompleted(habit.id, '2026-07-25', true)

    const context = buildAssistantContext({
      learningStartedAt: '2026-07-24T12:00:00.000Z',
      email: 'a@example.com',
      today: '2026-07-25',
    })

    expect(context.habits[0]?.completionsSinceLearning).toBe(1)
    expect(context.habits[0]?.completedToday).toBe(1)
  })

  it('classifies safety phrases locally', () => {
    expect(classifyClientSafety('I want to die')).toBe('self_harm')
    expect(classifyClientSafety('How is my walk streak?')).toBe('none')
  })

  it('clears consent on demand', () => {
    acceptAssistantConsent('uid:u1')
    clearAllAssistantConsent()
    expect(getAssistantAvailability({ email: 'a@example.com', displayName: 'A', uid: 'u1' })).toBe(
      'needs_consent',
    )
  })
})
