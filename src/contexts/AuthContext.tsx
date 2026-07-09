import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { mockAuthService } from '../services/auth/mockAuthService'
import type { IAuthService } from '../services/auth/IAuthService'
import type { AuthState, LoginCredentials, User } from '../types/auth'
import { AuthError } from '../types/auth'
import { setStoredUser } from '../utils/storage'

type AuthAction =
  | { type: 'HYDRATE_START' }
  | { type: 'HYDRATE_SUCCESS'; user: User | null }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_ERROR'; error: string }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'UPDATE_PROFILE'; user: User }
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
      return { ...state, status: 'loading', error: null }
    case 'LOGIN_SUCCESS':
      return {
        user: action.user,
        status: 'authenticated',
        error: null,
      }
    case 'LOGIN_ERROR':
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
      return { ...state, status: 'idle', error: null }
    default:
      return state
  }
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (displayName: string) => void
  clearError: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
  authService?: IAuthService
}

export function AuthProvider({
  children,
  authService = mockAuthService,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    dispatch({ type: 'HYDRATE_START' })
    const user = authService.getCurrentUser()
    dispatch({ type: 'HYDRATE_SUCCESS', user })
  }, [authService])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch({ type: 'LOGIN_START' })
      try {
        const user = await authService.login(credentials)
        dispatch({ type: 'LOGIN_SUCCESS', user })
      } catch (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : 'Something went wrong. Please try again.'
        dispatch({ type: 'LOGIN_ERROR', error: message })
        throw error
      }
    },
    [authService],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT_SUCCESS' })
  }, [authService])

  const updateProfile = useCallback((displayName: string) => {
    if (!state.user) return

    const trimmed = displayName.trim()
    if (!trimmed) return

    const user: User = {
      ...state.user,
      displayName: trimmed,
    }

    setStoredUser(user)
    dispatch({ type: 'UPDATE_PROFILE', user })
  }, [state.user])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      updateProfile,
      clearError,
      isAuthenticated: state.status === 'authenticated' && state.user !== null,
    }),
    [state, login, logout, updateProfile, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
