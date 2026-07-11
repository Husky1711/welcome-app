import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from '../../config/firebase'
import { AuthError, type LoginCredentials, type User } from '../../types/auth'
import { mapFirebaseUser } from '../../utils/authUser'
import { setStoredUser } from '../../utils/storage'
import type {
  IAuthService,
  RegisterCredentials,
  SendPasswordResetInput,
} from './IAuthService'
import { toAuthError } from './firebaseErrors'

function persistUser(user: User): User {
  setStoredUser(user)
  return user
}

function syncUser(firebaseUser: FirebaseUser | null): User | null {
  if (!firebaseUser?.email) return null
  const user = mapFirebaseUser(firebaseUser)
  setStoredUser(user)
  return user
}

export const firebaseAuthService: IAuthService = {
  subscribe(callback) {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(syncUser(firebaseUser))
    })
  },

  getCurrentUser(): User | null {
    const firebaseUser = getFirebaseAuth().currentUser
    return firebaseUser?.email ? mapFirebaseUser(firebaseUser) : null
  },

  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      )
      if (!credential.user.email) {
        throw new AuthError('Invalid email or password.')
      }
      return persistUser(mapFirebaseUser(credential.user))
    } catch (error) {
      throw toAuthError(error)
    }
  },

  async register({ email, password }: RegisterCredentials): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      )
      if (!credential.user.email) {
        throw new AuthError('Could not create your account. Please try again.')
      }
      return persistUser(mapFirebaseUser(credential.user))
    } catch (error) {
      throw toAuthError(error)
    }
  },

  async sendPasswordReset({ email }: SendPasswordResetInput): Promise<void> {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim())
    } catch (error) {
      throw toAuthError(error)
    }
  },

  async logout(): Promise<void> {
    await signOut(getFirebaseAuth())
  },

  async updateProfile(displayName: string): Promise<User> {
    const auth = getFirebaseAuth()
    const firebaseUser = auth.currentUser

    if (!firebaseUser?.email) {
      throw new AuthError('You must be signed in to update your profile.')
    }

    const trimmed = displayName.trim()
    if (!trimmed) {
      throw new AuthError('Display name cannot be empty.')
    }

    try {
      await updateFirebaseProfile(firebaseUser, { displayName: trimmed })
      return persistUser(mapFirebaseUser(firebaseUser))
    } catch (error) {
      throw toAuthError(error)
    }
  },
}
