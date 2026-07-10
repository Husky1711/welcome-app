import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { ROUTES } from './constants/routes'
import { rescheduleAllHabitReminders } from './services/habitReminderService'

export async function initializeNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  try {
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#1976D2' })
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
