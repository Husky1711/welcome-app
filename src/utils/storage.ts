import type { User } from '../types/auth'
import { STORAGE_KEYS } from '../constants/auth'

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
    if (!raw) return null

    const parsed = JSON.parse(raw) as User
    if (!parsed.email || !parsed.displayName) return null

    return parsed
  } catch {
    return null
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
}
