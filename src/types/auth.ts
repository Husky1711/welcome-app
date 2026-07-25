export interface User {
  email: string
  displayName: string
  /** Firebase Auth UID when signed in with Firebase; absent under mock auth. */
  uid?: string
  memberSince?: string
}

export type AuthStatus =
  | 'initializing'
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'error'

export interface AuthState {
  user: User | null
  status: AuthStatus
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
