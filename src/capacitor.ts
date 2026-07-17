import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { SplashScreen } from '@capacitor/splash-screen'
import { ROUTES } from './constants/routes'
import {
  ensureReminderInfrastructure,
  handleReminderNotificationFired,
  rescheduleAllHabitReminders,
} from './services/habitReminderService'
import { getStoredSettings } from './utils/settingsStorage'
import { syncStatusBarTheme } from './utils/statusBar'
import { ensureHabitTargetMigration } from './utils/habitStorage'

let reminderListenerRegistered = false

function registerReminderListeners(): void {
  if (reminderListenerRegistered || !Capacitor.isNativePlatform()) {
    return
  }

  reminderListenerRegistered = true

  void LocalNotifications.addListener('localNotificationReceived', (notification) => {
    void handleReminderNotificationFired(notification.id)
  })

  void LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
    void handleReminderNotificationFired(event.notification.id)
  })
}

export async function initializeNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  try {
    const settings = getStoredSettings()
    await syncStatusBarTheme(settings.theme, settings.appColor)
    await SplashScreen.hide()
  } catch (error) {
    console.warn('Native shell initialization skipped:', error)
  }

  registerReminderListeners()
  ensureHabitTargetMigration()
  await ensureReminderInfrastructure()
  void rescheduleAllHabitReminders(true)

  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      void rescheduleAllHabitReminders(true)
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
