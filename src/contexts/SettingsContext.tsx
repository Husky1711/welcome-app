import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppSettings, ThemeMode } from '../types/settings'
import {
  applyThemeToDocument,
  getStoredSettings,
  setStoredTheme,
} from '../utils/settingsStorage'
import { syncStatusBarTheme } from '../utils/statusBar'

interface SettingsContextValue {
  settings: AppSettings
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings())

  useEffect(() => {
    applyThemeToDocument(settings.theme)
    void syncStatusBarTheme(settings.theme)
  }, [settings.theme])

  const setTheme = useCallback((theme: ThemeMode) => {
    const next = setStoredTheme(theme)
    setSettings(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark')
  }, [settings.theme, setTheme])

  const value = useMemo(
    () => ({ settings, setTheme, toggleTheme }),
    [settings, setTheme, toggleTheme],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
