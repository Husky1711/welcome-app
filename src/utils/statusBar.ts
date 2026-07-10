import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { ThemeMode } from '../types/settings'

const LIGHT_BAR_COLOR = '#1976D2'
const DARK_BAR_COLOR = '#121212'

export async function syncStatusBarTheme(theme: ThemeMode): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  try {
    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: DARK_BAR_COLOR })
      return
    }

    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: LIGHT_BAR_COLOR })
  } catch {
    // Status bar may be unavailable on some devices
  }
}
