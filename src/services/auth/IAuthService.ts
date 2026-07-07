import type { LoginCredentials, User } from '../../types/auth'

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): User | null
}
