import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { Habit } from '../types/habit'
import {
  formatNextReminderLabel,
  formatReminderTimeLabel,
  getReminderScheduleAt,
  hasReminderTimePassedToday,
  normalizeReminderTime,
  parseReminderTime,
} from '../utils/reminderTime'
import { getHabitReminderIconPrefix } from '../utils/habitIcon'
import { getActiveHabits, setHabitReminderEnabled } from '../utils/habitStorage'

export {
  formatNextReminderLabel,
  formatReminderTimeLabel,
  getMinutesUntilNextReminder,
  getNextReminderFireDate,
  normalizeReminderTime,
  parseReminderTime,
} from '../utils/reminderTime'

export type ReminderPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported'

export type ReminderSyncStatus =
  | 'scheduled'
  | 'unsupported'
  | 'notifications_denied'
  | 'exact_alarms_denied'
  | 'schedule_failed'

export interface ReminderSyncResult {
  status: ReminderSyncStatus
  message?: string
}

export interface ReminderHealthResult {
  ok: boolean
  issue?: ReminderSyncStatus
  message?: string
}

const REMINDER_ISSUE_KEY = 'welcome-app.reminder-issue'
const DEFAULT_CHANNEL_ID = 'default'
let defaultChannelReady = false

async function ensureDefaultNotificationChannel(): Promise<void> {
  if (!isNativeReminderSupported() || defaultChannelReady) {
    return
  }

  try {
    const channels = await LocalNotifications.listChannels()
    const hasDefaultChannel = channels.channels.some((channel) => channel.id === DEFAULT_CHANNEL_ID)

    if (!hasDefaultChannel) {
      await LocalNotifications.createChannel({
        id: DEFAULT_CHANNEL_ID,
        name: 'Habit reminders',
        description: 'Daily habit reminder notifications',
        importance: 4,
        visibility: 1,
        vibration: true,
      })
    }

    defaultChannelReady = true
  } catch (error) {
    logReminder('Could not ensure default notification channel', {
      error: error instanceof Error ? error.message : 'unknown error',
    })
  }
}

function logReminder(message: string, details?: Record<string, unknown>): void {
  if (details) {
    console.info(`[WelcomeApp:reminders] ${message}`, details)
    return
  }

  console.info(`[WelcomeApp:reminders] ${message}`)
}

export function getHabitNotificationId(habitId: string): number {
  let hash = 0
  for (let index = 0; index < habitId.length; index += 1) {
    hash = (hash * 31 + habitId.charCodeAt(index)) >>> 0
  }

  return (hash % 900000) + 1000
}

export function getHabitTestNotificationId(habitId: string): number {
  return getHabitNotificationId(habitId) + 500000
}

export function isNativeReminderSupported(): boolean {
  return Capacitor.isNativePlatform()
}

export function getStoredReminderIssue(): string | null {
  try {
    return sessionStorage.getItem(REMINDER_ISSUE_KEY)
  } catch {
    return null
  }
}

export function setStoredReminderIssue(message: string): void {
  try {
    sessionStorage.setItem(REMINDER_ISSUE_KEY, message)
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function clearStoredReminderIssue(): void {
  try {
    sessionStorage.removeItem(REMINDER_ISSUE_KEY)
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export async function getReminderPermissionStatus(): Promise<ReminderPermissionStatus> {
  if (!isNativeReminderSupported()) return 'unsupported'

  const result = await LocalNotifications.checkPermissions()
  if (result.display === 'granted') return 'granted'
  if (result.display === 'denied') return 'denied'
  return 'prompt'
}

export async function requestReminderPermission(): Promise<ReminderPermissionStatus> {
  if (!isNativeReminderSupported()) return 'unsupported'

  const result = await LocalNotifications.requestPermissions()
  return result.display === 'granted' ? 'granted' : 'denied'
}

export async function isExactAlarmGranted(): Promise<boolean> {
  if (!isNativeReminderSupported()) return true

  const result = await LocalNotifications.checkExactNotificationSetting()
  return result.exact_alarm === 'granted'
}

export async function openExactAlarmSettings(): Promise<boolean> {
  if (!isNativeReminderSupported()) return false

  const result = await LocalNotifications.changeExactNotificationSetting()
  return result.exact_alarm === 'granted'
}

async function ensureNotificationPermission(
  requestIfNeeded: boolean,
): Promise<ReminderPermissionStatus> {
  let status = await getReminderPermissionStatus()

  if (status === 'granted' || status === 'unsupported') {
    return status
  }

  if (!requestIfNeeded) {
    return status
  }

  if (status === 'prompt') {
    return requestReminderPermission()
  }

  return status
}

async function verifyScheduledNotification(
  notificationId: number,
  expectedAt?: Date,
): Promise<boolean> {
  if (expectedAt && expectedAt.getTime() > Date.now() + 5_000) {
    return true
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const pending = await LocalNotifications.getPending()
    const notification = pending.notifications.find(
      (entry) => Number(entry.id) === notificationId,
    )

    if (notification) {
      return true
    }

    if (attempt < 2) {
      await new Promise((resolve) => window.setTimeout(resolve, 120))
    }
  }

  return false
}

async function scheduleNotificationAt(options: {
  id: number
  title: string
  body: string
  at: Date
}): Promise<void> {
  await ensureDefaultNotificationChannel()

  const result = await LocalNotifications.schedule({
    notifications: [
      {
        id: options.id,
        channelId: DEFAULT_CHANNEL_ID,
        title: options.title,
        body: options.body,
        schedule: {
          at: options.at.toISOString() as unknown as Date,
          allowWhileIdle: true,
        },
      },
    ],
  })

  const scheduled = result.notifications?.some((entry) => Number(entry.id) === options.id)
  if (!scheduled) {
    logReminder('Schedule call returned without notification id; continuing', {
      notificationId: options.id,
      at: options.at.toISOString(),
    })
  }
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  if (!isNativeReminderSupported()) return

  await LocalNotifications.cancel({
    notifications: [
      { id: getHabitNotificationId(habitId) },
      { id: getHabitTestNotificationId(habitId) },
    ],
  })
}

export async function cancelAllHabitReminders(): Promise<void> {
  if (!isNativeReminderSupported()) return

  const habits = getActiveHabits()
  if (habits.length === 0) return

  await LocalNotifications.cancel({
    notifications: habits.map((habit) => ({ id: getHabitNotificationId(habit.id) })),
  })
}

export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  if (!isNativeReminderSupported() || !habit.reminderEnabled) return

  const normalizedTime = normalizeReminderTime(habit.reminderTime)
  if (!normalizedTime || !parseReminderTime(normalizedTime)) {
    throw new Error('Invalid reminder time.')
  }

  const notificationId = getHabitNotificationId(habit.id)
  const scheduleAt = getReminderScheduleAt(normalizedTime)
  const delayMs = scheduleAt.getTime() - Date.now()

  await LocalNotifications.cancel({
    notifications: [{ id: notificationId }],
  })

  try {
    await scheduleNotificationAt({
      id: notificationId,
      title: `${getHabitReminderIconPrefix(habit.icon)} Habit reminder`,
      body: `Time for: ${habit.title}`,
      at: scheduleAt,
    })
  } catch (error) {
    logReminder('Native schedule call failed', {
      habitId: habit.id,
      notificationId,
      error: error instanceof Error ? error.message : 'unknown error',
    })
    throw error
  }

  logReminder('Scheduled habit reminder', {
    habitId: habit.id,
    notificationId,
    reminderTime: normalizedTime,
    scheduleAt: scheduleAt.toISOString(),
    delayMs,
  })

  const pendingConfirmed = await verifyScheduledNotification(notificationId, scheduleAt)
  if (!pendingConfirmed) {
    throw new Error('Reminder could not be registered on this device.')
  }
}

export async function scheduleReminderTestPing(
  habit: Habit,
  delaySeconds = 30,
): Promise<ReminderSyncResult> {
  if (!isNativeReminderSupported()) {
    return { status: 'unsupported' }
  }

  const permission = await ensureNotificationPermission(true)
  if (permission !== 'granted') {
    return {
      status: 'notifications_denied',
      message:
        'Notification permission is required before sending a test reminder.',
    }
  }

  const exactAlarmsGranted = await isExactAlarmGranted()
  const testId = getHabitTestNotificationId(habit.id)
  const at = new Date(Date.now() + delaySeconds * 1000)

  try {
    await scheduleNotificationAt({
      id: testId,
      title: `${getHabitReminderIconPrefix(habit.icon)} Test reminder`,
      body: `Testing: ${habit.title}`,
      at,
    })

    logReminder('Scheduled test reminder', {
      habitId: habit.id,
      notificationId: testId,
      at: at.toISOString(),
    })

    const scheduled = await verifyScheduledNotification(testId, at)
    if (!scheduled) {
      throw new Error('Test reminder could not be registered on this device.')
    }

    return {
      status: 'scheduled',
      message: exactAlarmsGranted
        ? `Test notification in ${delaySeconds} seconds. Press Home to background the app and wait.`
        : `Test notification in ${delaySeconds} seconds. Press Home, then wait. For reliable timing, allow Alarms & reminders for Welcome App in settings.`,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not schedule the test reminder on this device.'
    return {
      status: 'schedule_failed',
      message,
    }
  }
}

export async function handleReminderNotificationFired(notificationId: number): Promise<void> {
  if (!isNativeReminderSupported()) return

  const habit = getActiveHabits().find(
    (entry) => getHabitNotificationId(entry.id) === notificationId && entry.reminderEnabled,
  )

  if (!habit) return

  logReminder('Rescheduling habit reminder after notification fired', {
    habitId: habit.id,
    notificationId,
  })

  try {
    await scheduleHabitReminder(habit)
  } catch (error) {
    logReminder('Failed to reschedule habit reminder after notification fired', {
      habitId: habit.id,
      error: error instanceof Error ? error.message : 'unknown error',
    })
  }
}

export async function rescheduleAllHabitReminders(
  requestPermission = false,
): Promise<ReminderHealthResult> {
  if (!isNativeReminderSupported()) {
    return { ok: true }
  }

  const enabledHabits = getActiveHabits().filter((habit) => habit.reminderEnabled)
  if (enabledHabits.length === 0) {
    clearStoredReminderIssue()
    return { ok: true }
  }

  const permission = await ensureNotificationPermission(requestPermission)
  if (permission !== 'granted') {
    const message =
      'Habit reminders are on, but notifications are blocked. Enable notifications for Welcome App in your device settings, then reopen the Habits tab.'
    setStoredReminderIssue(message)
    return {
      ok: false,
      issue: 'notifications_denied',
      message,
    }
  }

  const exactAlarmsGranted = await isExactAlarmGranted()
  if (!exactAlarmsGranted) {
    setStoredReminderIssue(
      'For on-time daily reminders, allow Alarms & reminders for Welcome App in your device settings.',
    )
  } else {
    clearStoredReminderIssue()
  }

  try {
    await LocalNotifications.cancel({
      notifications: enabledHabits.map((habit) => ({
        id: getHabitNotificationId(habit.id),
      })),
    })

    for (const habit of enabledHabits) {
      await scheduleHabitReminder(habit)
    }

    return exactAlarmsGranted
      ? { ok: true }
      : {
          ok: true,
          issue: 'exact_alarms_denied',
          message:
            'Reminders are scheduled, but timing may be delayed until you allow Alarms & reminders in app settings.',
        }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not schedule habit reminders on this device.'

    setStoredReminderIssue(message)
    return {
      ok: false,
      issue: 'schedule_failed',
      message,
    }
  }
}

export async function syncHabitReminder(habit: Habit): Promise<ReminderSyncResult> {
  if (!habit.reminderEnabled) {
    await cancelHabitReminder(habit.id)
    return { status: 'scheduled' }
  }

  if (!isNativeReminderSupported()) {
    return { status: 'unsupported' }
  }

  const permission = await ensureNotificationPermission(true)
  if (permission !== 'granted') {
    setHabitReminderEnabled(habit.id, false)
    const message =
      'Notification permission denied. Enable notifications in your device settings, then turn the reminder on again.'
    setStoredReminderIssue(message)
    return {
      status: 'notifications_denied',
      message,
    }
  }

  const exactAlarmsGranted = await isExactAlarmGranted()
  const passedToday = hasReminderTimePassedToday(habit.reminderTime)

  try {
    await scheduleHabitReminder(habit)
    clearStoredReminderIssue()

    if (!exactAlarmsGranted) {
      const message =
        'Reminder saved. For on-time delivery, allow Alarms & reminders for Welcome App in your device settings.'
      setStoredReminderIssue(message)
      return {
        status: 'exact_alarms_denied',
        message: `${message} Next reminder: ${formatNextReminderLabel(habit.reminderTime)}.`,
      }
    }

    if (passedToday) {
      return {
        status: 'scheduled',
        message: `${formatReminderTimeLabel(habit.reminderTime)} already passed today. Next reminder ${formatNextReminderLabel(habit.reminderTime)}. Press Home and wait, or pick a later time for today.`,
      }
    }

    return {
      status: 'scheduled',
      message: `Next reminder ${formatNextReminderLabel(habit.reminderTime)}. Press Home to background the app and wait.`,
    }
  } catch (error) {
    setHabitReminderEnabled(habit.id, false)
    const message =
      error instanceof Error
        ? error.message
        : 'Could not schedule this reminder on your device.'
    setStoredReminderIssue(message)
    return {
      status: 'schedule_failed',
      message,
    }
  }
}

export function hasEnabledHabitReminders(): boolean {
  return getActiveHabits().some((habit) => habit.reminderEnabled)
}

export async function ensureReminderInfrastructure(): Promise<void> {
  if (!isNativeReminderSupported()) {
    return
  }

  await ensureDefaultNotificationChannel()
}
