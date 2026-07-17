import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { APP_COLOR_OPTIONS, DEFAULT_APP_COLOR } from '../constants/appColors'
import type { AppColor, ThemeMode } from '../types/settings'

const DARK_BAR_COLOR = '#121212'

export async function syncStatusBarTheme(
  theme: ThemeMode,
  appColor: AppColor = DEFAULT_APP_COLOR,
): Promise<void> {
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
    const selectedColor =
      APP_COLOR_OPTIONS.find((option) => option.id === appColor) ??
      APP_COLOR_OPTIONS[0]
    await StatusBar.setBackgroundColor({ color: selectedColor.swatches[0] })
  } catch {
    // Status bar may be unavailable on some devices
  }
}
