import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { SplashScreen } from '@capacitor/splash-screen'
import { BOTTOM_NAV_ROUTES } from './constants/navigation'
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

const AUTH_EXIT_ROUTES = new Set<string>([
  ROUTES.LOGIN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
])

const PRIMARY_TAB_ROUTES = new Set<string>(BOTTOM_NAV_ROUTES)

function getAppPath(): string {
  const raw = window.location.hash.replace(/^#/, '') || ROUTES.LOGIN
  return raw.split('?')[0] || ROUTES.LOGIN
}

function goToHash(path: string): void {
  const next = path.startsWith('/') ? path : `/${path}`
  if (getAppPath() === next) return
  window.location.hash = next
}

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

  CapacitorApp.addListener('backButton', () => {
    const path = getAppPath()

    // Login / auth screens and Home are app roots — leave the app.
    if (AUTH_EXIT_ROUTES.has(path) || path === ROUTES.WELCOME) {
      void CapacitorApp.exitApp()
      return
    }

    // Other bottom tabs return to Home first (then Home exits).
    if (PRIMARY_TAB_ROUTES.has(path)) {
      goToHash(ROUTES.WELCOME)
      return
    }

    // Note editor returns to the notes list.
    if (path.startsWith(`${ROUTES.NOTES}/`)) {
      goToHash(ROUTES.NOTES)
      return
    }

    // Secondary screens (Notes, Coach, Settings, Profile) → Home.
    goToHash(ROUTES.WELCOME)
  })
}
