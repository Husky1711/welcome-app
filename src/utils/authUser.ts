import type { User as FirebaseUser } from 'firebase/auth'
import type { User } from '../types/auth'

export function deriveDisplayName(email: string): string {
  return email.split('@')[0] || email
}

export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  const email = firebaseUser.email ?? ''
  return {
    email,
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName?.trim() || deriveDisplayName(email),
    memberSince: firebaseUser.metadata.creationTime || undefined,
  }
}
