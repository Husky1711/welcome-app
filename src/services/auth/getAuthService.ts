import type { IAuthService } from './IAuthService'
import { firebaseAuthService } from './firebaseAuthService'
import { mockAuthService } from './mockAuthService'

export function getAuthProvider(): 'mock' | 'firebase' {
  return import.meta.env.VITE_AUTH_PROVIDER === 'firebase' ? 'firebase' : 'mock'
}

export function getAuthService(): IAuthService {
  return getAuthProvider() === 'firebase' ? firebaseAuthService : mockAuthService
}
