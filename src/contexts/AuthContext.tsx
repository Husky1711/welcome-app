import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { IAuthService, RegisterCredentials } from '../services/auth/IAuthService'
import { getAuthService } from '../services/auth/getAuthService'
import type { AuthState, LoginCredentials } from '../types/auth'
import { AuthError } from '../types/auth'

type AuthAction =
  | { type: 'HYDRATE_START' }
  | { type: 'HYDRATE_SUCCESS'; user: AuthState['user'] }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: NonNullable<AuthState['user']> }
  | { type: 'LOGIN_ERROR'; error: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; user: NonNullable<AuthState['user']> }
  | { type: 'REGISTER_ERROR'; error: string }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'UPDATE_PROFILE'; user: NonNullable<AuthState['user']> }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  status: 'initializing',
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE_START':
      return { ...state, status: 'initializing', error: null }
    case 'HYDRATE_SUCCESS':
      return action.user
        ? { user: action.user, status: 'authenticated', error: null }
        : { user: null, status: 'idle', error: null }
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, status: 'loading', error: null }
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        user: action.user,
        status: 'authenticated',
        error: null,
      }
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return { ...state, status: 'error', error: action.error }
    case 'LOGOUT_SUCCESS':
      return { user: null, status: 'idle', error: null }
    case 'UPDATE_PROFILE':
      return {
        user: action.user,
        status: 'authenticated',
        error: null,
      }
    case 'CLEAR_ERROR':
      return { ...state, status: state.user ? 'authenticated' : 'idle', error: null }
    default:
      return state
  }
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
  clearError: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
  authService?: IAuthService
}

function toErrorMessage(error: unknown): string {
  return error instanceof AuthError
    ? error.message
    : 'Something went wrong. Please try again.'
}

export function AuthProvider({
  children,
  authService = getAuthService(),
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'HYDRATE_START' })
    return authService.subscribe((user) => {
      dispatch({ type: 'HYDRATE_SUCCESS', user })
    })
  }, [authService])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch({ type: 'LOGIN_START' })
      try {
        const user = await authService.login(credentials)
        dispatch({ type: 'LOGIN_SUCCESS', user })
      } catch (error) {
        const message = toErrorMessage(error)
        dispatch({ type: 'LOGIN_ERROR', error: message })
        throw error
      }
    },
    [authService],
  )

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      dispatch({ type: 'REGISTER_START' })
      try {
        const user = await authService.register(credentials)
        dispatch({ type: 'REGISTER_SUCCESS', user })
      } catch (error) {
        const message = toErrorMessage(error)
        dispatch({ type: 'REGISTER_ERROR', error: message })
        throw error
      }
    },
    [authService],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT_SUCCESS' })
  }, [authService])

  const updateProfile = useCallback(
    async (displayName: string) => {
      const user = await authService.updateProfile(displayName)
      dispatch({ type: 'UPDATE_PROFILE', user })
    },
    [authService],
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateProfile,
      clearError,
      isAuthenticated: state.status === 'authenticated' && state.user !== null,
    }),
    [state, login, register, logout, updateProfile, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
