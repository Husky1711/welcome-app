import type { AssistantContextPayload, AssistantHabitSnapshot } from '../types/assistant'
import { eachDateInRange, formatLocalDate } from './dateUtils'
import {
  countCompletedLogsInRange,
  getActiveHabits,
  getActiveTarget,
  isHabitCompletedOnDate,
} from './habitStorage'
import { getStoredNotes, notesOwnerKey } from './noteStorage'
import { parseReminderTime } from './reminderTime'

const MAX_HABITS_IN_CONTEXT = 12

function formatReminderTimeLabel(time: string): string | null {
  const parsed = parseReminderTime(time)
  if (!parsed) return null
  const ampm = parsed.hour >= 12 ? 'PM' : 'AM'
  const hour12 = parsed.hour % 12 || 12
  return `${hour12}:${String(parsed.minute).padStart(2, '0')} ${ampm}`
}

/**
 * Build minimized request-time context for Leafu / Coach.
 * Only includes activity on/after learningStartedAt — never pre-consent history.
 */
export function buildAssistantContext(input: {
  learningStartedAt: string
  email?: string | null
  today?: string
}): AssistantContextPayload {
  const today = input.today ?? formatLocalDate()
  const learningDay = input.learningStartedAt.slice(0, 10)
  const rangeStart = learningDay > today ? today : learningDay
  const dates = eachDateInRange(rangeStart, today)

  const habits = getActiveHabits()
    .slice(0, MAX_HABITS_IN_CONTEXT)
    .map((habit): AssistantHabitSnapshot => {
      const target = getActiveTarget(habit.id, today)
      const completedDays = dates.filter((date) => isHabitCompletedOnDate(habit.id, date))
      const reminderEnabled = Boolean(habit.reminderEnabled)
      return {
        id: habit.id,
        title: habit.title,
        targetPerDay: target?.period === 'daily' ? target.targetFrequency : 1,
        completedToday: isHabitCompletedOnDate(habit.id, today) ? 1 : 0,
        completionsSinceLearning: countCompletedLogsInRange(habit.id, rangeStart, today),
        daysActiveSinceLearning: completedDays.length,
        reminderEnabled,
        reminderTime: reminderEnabled ? habit.reminderTime : null,
        reminderTimeLabel: reminderEnabled ? formatReminderTimeLabel(habit.reminderTime) : null,
      }
    })

  const incompleteToday = habits
    .filter((habit) => habit.completedToday < habit.targetPerDay)
    .map((habit) => habit.title)

  const notes = getStoredNotes(notesOwnerKey(input.email)).filter((note) => note.shareWithCoach)
  const sharedNoteTitles = notes
    .slice(0, 8)
    .map((note) => note.title.trim() || 'Untitled')

  return {
    learningStartedAt: input.learningStartedAt,
    today,
    habitCount: getActiveHabits().length,
    habits,
    incompleteToday,
    sharedNoteTitles,
  }
}
