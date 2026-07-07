import { beforeEach, describe, expect, it } from 'vitest'
import { MOCK_CREDENTIALS } from '../../constants/auth'
import { AuthError } from '../../types/auth'
import { clearStoredUser } from '../../utils/storage'
import { deriveDisplayName, mockAuthService } from './mockAuthService'

describe('deriveDisplayName', () => {
  it('returns the local part of an email', () => {
    expect(deriveDisplayName('admin@example.com')).toBe('admin')
  })
})

describe('mockAuthService', () => {
  beforeEach(() => {
    clearStoredUser()
  })

  it('logs in with valid credentials', async () => {
    const user = await mockAuthService.login({
      email: MOCK_CREDENTIALS.email,
      password: MOCK_CREDENTIALS.password,
    })

    expect(user).toEqual({
      email: MOCK_CREDENTIALS.email,
      displayName: 'admin',
    })
    expect(mockAuthService.getCurrentUser()).toEqual(user)
  })

  it('rejects invalid credentials', async () => {
    await expect(
      mockAuthService.login({
        email: 'wrong@example.com',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(AuthError)
  })

  it('clears the session on logout', async () => {
    await mockAuthService.login({
      email: MOCK_CREDENTIALS.email,
      password: MOCK_CREDENTIALS.password,
    })

    await mockAuthService.logout()
    expect(mockAuthService.getCurrentUser()).toBeNull()
  })
})
