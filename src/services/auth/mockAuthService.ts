import { MOCK_CREDENTIALS } from '../../constants/auth'
import { AuthError, type LoginCredentials, type User } from '../../types/auth'
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../utils/storage'
import type { IAuthService } from './IAuthService'

export function deriveDisplayName(email: string): string {
  return email.split('@')[0] || email
}

export const mockAuthService: IAuthService = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const normalizedEmail = email.trim().toLowerCase()
    const validEmail = MOCK_CREDENTIALS.email.toLowerCase()

    if (
      normalizedEmail !== validEmail ||
      password !== MOCK_CREDENTIALS.password
    ) {
      throw new AuthError('Invalid email or password')
    }

    const user: User = {
      email: MOCK_CREDENTIALS.email,
      displayName: deriveDisplayName(MOCK_CREDENTIALS.email),
    }

    setStoredUser(user)
    return user
  },

  async logout(): Promise<void> {
    clearStoredUser()
  },

  getCurrentUser(): User | null {
    return getStoredUser()
  },
}
