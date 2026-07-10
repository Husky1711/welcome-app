import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { ROUTES } from './constants/routes'
import { rescheduleAllHabitReminders } from './services/habitReminderService'
import { getStoredSettings } from './utils/settingsStorage'
import { syncStatusBarTheme } from './utils/statusBar'

export async function initializeNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  try {
    await syncStatusBarTheme(getStoredSettings().theme)
    await SplashScreen.hide()
  } catch (error) {
    console.warn('Native shell initialization skipped:', error)
  }

  void rescheduleAllHabitReminders()

  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      void rescheduleAllHabitReminders()
    }
  })

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    const path = window.location.hash.replace('#', '') || ROUTES.LOGIN

    if (path === ROUTES.LOGIN) {
      void CapacitorApp.exitApp()
      return
    }

    if (canGoBack) {
      window.history.back()
      return
    }

    window.location.hash = ROUTES.LOGIN
  })
}
