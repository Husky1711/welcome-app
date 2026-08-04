import { STORAGE_KEYS } from '../constants/auth'
import { DEFAULT_APP_COLOR, isAppColor } from '../constants/appColors'
import type { AppColor, AppSettings, ThemeMode } from '../types/settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  appColor: DEFAULT_APP_COLOR,
  // Off until real artwork ships (docs/COMPANION_*.md character platform).
  // Roaming/no-go logic is complete; only the character asset is placeholder.
  companionEnabled: false,
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as AppSettings
    if (parsed.theme !== 'light' && parsed.theme !== 'dark') {
      return DEFAULT_SETTINGS
    }

    return {
      theme: parsed.theme,
      appColor: isAppColor(parsed.appColor) ? parsed.appColor : DEFAULT_APP_COLOR,
      companionEnabled:
        typeof parsed.companionEnabled === 'boolean'
          ? parsed.companionEnabled
          : DEFAULT_SETTINGS.companionEnabled,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function setStoredTheme(theme: ThemeMode): AppSettings {
  const settings: AppSettings = { ...getStoredSettings(), theme }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  return settings
}

export function setStoredAppColor(appColor: AppColor): AppSettings {
  const settings: AppSettings = { ...getStoredSettings(), appColor }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  return settings
}

export function setStoredCompanionEnabled(companionEnabled: boolean): AppSettings {
  const settings: AppSettings = { ...getStoredSettings(), companionEnabled }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  return settings
}

export function clearStoredSettings(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
}

export function applySettingsToDocument(settings: AppSettings): void {
  const { theme, appColor } = settings
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.dataset.appColor = appColor
}
