import { MOCK_CREDENTIALS, STORAGE_KEYS } from '../../constants/auth'
import {
  AuthError,
  type LoginCredentials,
  type User,
} from '../../types/auth'
import { deriveDisplayName } from '../../utils/authUser'
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../utils/storage'
import type {
  IAuthService,
  RegisterCredentials,
  SendPasswordResetInput,
} from './IAuthService'

function readCredentialStore(): Record<string, string> {
  const defaults = {
    [MOCK_CREDENTIALS.email.toLowerCase()]: MOCK_CREDENTIALS.password,
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS)
    const stored = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}

function writeCredential(email: string, password: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  let custom: Record<string, string> = {}

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS)
    custom = raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    custom = {}
  }

  custom[normalizedEmail] = password
  localStorage.setItem(STORAGE_KEYS.AUTH_CREDENTIALS, JSON.stringify(custom))
}

function resolveMemberSince(email: string, existingMemberSince?: string): string {
  if (existingMemberSince) {
    return existingMemberSince
  }

  const storedUser = getStoredUser()
  if (storedUser?.email.trim().toLowerCase() === email.trim().toLowerCase() && storedUser.memberSince) {
    return storedUser.memberSince
  }

  return new Date().toISOString()
}

async function authenticate(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const normalizedEmail = email.trim().toLowerCase()
  const credentials = readCredentialStore()
  const storedPassword = credentials[normalizedEmail]

  if (!storedPassword || password !== storedPassword) {
    throw new AuthError('Invalid email or password')
  }

  const resolvedEmail =
    normalizedEmail === MOCK_CREDENTIALS.email.toLowerCase()
      ? MOCK_CREDENTIALS.email
      : email.trim()
  const storedUser = getStoredUser()

  const user: User = {
    email: resolvedEmail,
    displayName:
      storedUser?.email.trim().toLowerCase() === normalizedEmail
        ? storedUser.displayName
        : deriveDisplayName(email.trim()),
    memberSince: resolveMemberSince(resolvedEmail, storedUser?.memberSince),
  }

  setStoredUser(user)
  return user
}

export const mockAuthService: IAuthService = {
  subscribe(callback) {
    callback(mockAuthService.getCurrentUser())
    return () => {}
  },

  getCurrentUser(): User | null {
    return getStoredUser()
  },

  async login({ email, password }: LoginCredentials): Promise<User> {
    return authenticate(email, password)
  },

  async register({ email, password }: RegisterCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const normalizedEmail = email.trim().toLowerCase()
    const credentials = readCredentialStore()

    if (credentials[normalizedEmail]) {
      throw new AuthError('An account with this email already exists')
    }

    writeCredential(normalizedEmail, password)

    const user: User = {
      email: email.trim(),
      displayName: deriveDisplayName(email.trim()),
      memberSince: new Date().toISOString(),
    }

    setStoredUser(user)
    return user
  },

  async sendPasswordReset({ email }: SendPasswordResetInput): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const normalizedEmail = email.trim().toLowerCase()
    const credentials = readCredentialStore()

    if (!credentials[normalizedEmail]) {
      // Avoid revealing whether the email exists.
      return
    }
  },

  async logout(): Promise<void> {
    clearStoredUser()
  },

  async updateProfile(displayName: string): Promise<User> {
    const currentUser = getStoredUser()
    if (!currentUser) {
      throw new AuthError('You must be signed in to update your profile.')
    }

    const trimmed = displayName.trim()
    if (!trimmed) {
      throw new AuthError('Display name cannot be empty.')
    }

    const user: User = {
      ...currentUser,
      displayName: trimmed,
    }

    setStoredUser(user)
    return user
  },
}

export { deriveDisplayName } from '../../utils/authUser'
