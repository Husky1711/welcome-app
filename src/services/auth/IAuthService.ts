import type { LoginCredentials, User } from '../../types/auth'

export interface RegisterCredentials {
  email: string
  password: string
}

export interface SendPasswordResetInput {
  email: string
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>
  register(credentials: RegisterCredentials): Promise<User>
  sendPasswordReset(input: SendPasswordResetInput): Promise<void>
  logout(): Promise<void>
  getCurrentUser(): User | null
  subscribe(callback: (user: User | null) => void): () => void
  updateProfile(displayName: string): Promise<User>
}
