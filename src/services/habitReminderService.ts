import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { Habit } from '../types/habit'
import { getActiveHabits } from '../utils/habitStorage'

export type ReminderPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported'

export function parseReminderTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

export function formatReminderTimeLabel(time: string): string {
  const parsed = parseReminderTime(time)
  if (!parsed) return time

  const date = new Date()
  date.setHours(parsed.hour, parsed.minute, 0, 0)

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getHabitNotificationId(habitId: string): number {
  let hash = 0
  for (let index = 0; index < habitId.length; index += 1) {
    hash = (hash * 31 + habitId.charCodeAt(index)) >>> 0
  }

  return (hash % 900000) + 1000
}

export function isNativeReminderSupported(): boolean {
  return Capacitor.isNativePlatform()
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

export async function cancelHabitReminder(habitId: string): Promise<void> {
  if (!isNativeReminderSupported()) return

  await LocalNotifications.cancel({
    notifications: [{ id: getHabitNotificationId(habitId) }],
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

  const time = parseReminderTime(habit.reminderTime)
  if (!time) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: getHabitNotificationId(habit.id),
        title: `${habit.icon} Habit reminder`,
        body: `Time for: ${habit.title}`,
        schedule: {
          on: { hour: time.hour, minute: time.minute },
          repeats: true,
          allowWhileIdle: true,
        },
      },
    ],
  })
}

export async function rescheduleAllHabitReminders(): Promise<void> {
  if (!isNativeReminderSupported()) return

  const status = await getReminderPermissionStatus()
  if (status !== 'granted') return

  const habits = getActiveHabits()
  await LocalNotifications.cancel({
    notifications: habits.map((habit) => ({ id: getHabitNotificationId(habit.id) })),
  })

  for (const habit of habits) {
    if (habit.reminderEnabled) {
      await scheduleHabitReminder(habit)
    }
  }
}

export async function syncHabitReminder(habit: Habit): Promise<ReminderPermissionStatus> {
  if (!habit.reminderEnabled) {
    await cancelHabitReminder(habit.id)
    return 'unsupported'
  }

  if (!isNativeReminderSupported()) {
    return 'unsupported'
  }

  let status = await getReminderPermissionStatus()
  if (status !== 'granted') {
    status = await requestReminderPermission()
  }

  if (status !== 'granted') {
    return status
  }

  await scheduleHabitReminder(habit)
  return 'granted'
}
