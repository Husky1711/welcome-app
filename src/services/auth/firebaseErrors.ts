import { AuthError } from '../../types/auth'

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/missing-password': 'Enter your password.',
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error
  }

  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null

  const message = code
    ? FIREBASE_AUTH_MESSAGES[code] ?? 'Something went wrong. Please try again.'
    : 'Something went wrong. Please try again.'

  return new AuthError(message)
}
