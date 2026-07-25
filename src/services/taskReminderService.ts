import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { NoteDocument } from '../types/note'
import { normalizeReminderTime, parseReminderTime } from '../utils/reminderTime'
import { getStoredNotes } from '../utils/noteStorage'

const TASK_CHANNEL_ID = 'task-reminders'
const DEFAULT_TASK_REMINDER_TIME = '09:00'
let taskChannelReady = false

function logTaskReminder(message: string, details?: Record<string, unknown>): void {
  if (details) {
    console.info(`[WelcomeApp:task-reminders] ${message}`, details)
    return
  }
  console.info(`[WelcomeApp:task-reminders] ${message}`)
}

export function getTaskNotificationId(noteId: string): number {
  let hash = 0
  for (let index = 0; index < noteId.length; index += 1) {
    hash = (hash * 31 + noteId.charCodeAt(index)) >>> 0
  }
  // Keep well above habit reminder IDs (1000–901000 range).
  return 2_000_000 + (hash % 700_000)
}

export function isNativeTaskReminderSupported(): boolean {
  return Capacitor.isNativePlatform()
}

async function ensureTaskNotificationChannel(): Promise<void> {
  if (!isNativeTaskReminderSupported() || taskChannelReady) return

  try {
    const channels = await LocalNotifications.listChannels()
    const hasChannel = channels.channels.some((channel) => channel.id === TASK_CHANNEL_ID)
    if (!hasChannel) {
      await LocalNotifications.createChannel({
        id: TASK_CHANNEL_ID,
        name: 'Task reminders',
        description: 'One-time reminders for Notes tasks',
        importance: 4,
        visibility: 1,
        vibration: true,
      })
    }
    taskChannelReady = true
  } catch (error) {
    logTaskReminder('Could not ensure task notification channel', {
      error: error instanceof Error ? error.message : 'unknown error',
    })
  }
}

function resolveTaskReminderTime(time: string | null | undefined): string {
  return normalizeReminderTime(time ?? DEFAULT_TASK_REMINDER_TIME) ?? DEFAULT_TASK_REMINDER_TIME
}

export function getTaskReminderFireDate(
  dueDate: string,
  reminderTime: string | null | undefined,
): Date | null {
  const time = resolveTaskReminderTime(reminderTime)
  const parsed = parseReminderTime(time)
  if (!parsed) return null

  const [year, month, day] = dueDate.split('-').map(Number)
  if (!year || !month || !day) return null

  const at = new Date(year, month - 1, day, parsed.hour, parsed.minute, 0, 0)
  if (Number.isNaN(at.getTime())) return null
  return at
}

export async function cancelTaskReminder(noteId: string): Promise<void> {
  if (!isNativeTaskReminderSupported()) return
  await LocalNotifications.cancel({
    notifications: [{ id: getTaskNotificationId(noteId) }],
  })
}

export async function scheduleTaskReminder(note: NoteDocument): Promise<void> {
  if (!isNativeTaskReminderSupported()) return
  if (note.kind !== 'task' || !note.reminderEnabled || note.completed || !note.dueDate) {
    await cancelTaskReminder(note.id)
    return
  }

  const fireAt = getTaskReminderFireDate(note.dueDate, note.reminderTime)
  if (!fireAt || fireAt.getTime() <= Date.now() + 5_000) {
    await cancelTaskReminder(note.id)
    return
  }

  await ensureTaskNotificationChannel()
  const notificationId = getTaskNotificationId(note.id)
  await LocalNotifications.cancel({
    notifications: [{ id: notificationId }],
  })

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId,
        channelId: TASK_CHANNEL_ID,
        title: 'Task reminder',
        body: note.title.trim() || 'You have a task due',
        schedule: {
          at: fireAt.toISOString() as unknown as Date,
          allowWhileIdle: true,
        },
      },
    ],
  })

  logTaskReminder('Scheduled task reminder', {
    noteId: note.id,
    notificationId,
    at: fireAt.toISOString(),
  })
}

export async function syncTaskReminder(note: NoteDocument): Promise<void> {
  try {
    await scheduleTaskReminder(note)
  } catch (error) {
    logTaskReminder('Failed to sync task reminder', {
      noteId: note.id,
      error: error instanceof Error ? error.message : 'unknown error',
    })
  }
}

export async function rescheduleAllTaskReminders(ownerKey: string): Promise<void> {
  if (!isNativeTaskReminderSupported()) return

  const notes = getStoredNotes(ownerKey).filter((note) => note.kind === 'task')
  for (const note of notes) {
    await syncTaskReminder(note)
  }
}

export async function cancelAllTaskReminders(ownerKey: string): Promise<void> {
  if (!isNativeTaskReminderSupported()) return
  const notes = getStoredNotes(ownerKey).filter((note) => note.kind === 'task')
  if (notes.length === 0) return
  await LocalNotifications.cancel({
    notifications: notes.map((note) => ({ id: getTaskNotificationId(note.id) })),
  })
}

export async function cancelTaskRemindersForStoredNotes(): Promise<void> {
  if (!isNativeTaskReminderSupported() || typeof localStorage === 'undefined') return

  const ids: number[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith('welcome_app.notes.v2.')) continue
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<{ id?: string; kind?: string }>
      if (!Array.isArray(parsed)) continue
      parsed.forEach((note) => {
        if (note.kind === 'task' && typeof note.id === 'string') {
          ids.push(getTaskNotificationId(note.id))
        }
      })
    } catch {
      // ignore bad payloads
    }
  }

  if (ids.length === 0) return
  await LocalNotifications.cancel({
    notifications: ids.map((id) => ({ id })),
  })
}
