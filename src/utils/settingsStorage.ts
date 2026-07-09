import { STORAGE_KEYS } from '../constants/auth'
import type { AppSettings, ThemeMode } from '../types/settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as AppSettings
    if (parsed.theme !== 'light' && parsed.theme !== 'dark') {
      return DEFAULT_SETTINGS
    }

    return parsed
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function setStoredTheme(theme: ThemeMode): AppSettings {
  const settings: AppSettings = { theme }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  return settings
}

export function clearStoredSettings(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
}

export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
