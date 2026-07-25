import type { AssistantContextPayload, AssistantHabitSnapshot } from '../types/assistant'
import { eachDateInRange, formatLocalDate } from './dateUtils'
import {
  countCompletedLogsInRange,
  getActiveHabits,
  getActiveTarget,
  isHabitCompletedOnDate,
} from './habitStorage'
import { getStoredNotes, notesOwnerKey } from './noteStorage'

const MAX_HABITS_IN_CONTEXT = 12

/**
 * Build minimized request-time context for Coach.
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
      return {
        id: habit.id,
        title: habit.title,
        targetPerDay: target?.period === 'daily' ? target.targetFrequency : 1,
        completedToday: isHabitCompletedOnDate(habit.id, today) ? 1 : 0,
        completionsSinceLearning: countCompletedLogsInRange(habit.id, rangeStart, today),
        daysActiveSinceLearning: completedDays.length,
      }
    })

  const notes = getStoredNotes(notesOwnerKey(input.email)).filter((note) => note.shareWithCoach)
  const sharedNoteTitles = notes
    .slice(0, 8)
    .map((note) => note.title.trim() || 'Untitled')

  return {
    learningStartedAt: input.learningStartedAt,
    today,
    habitCount: getActiveHabits().length,
    habits,
    sharedNoteTitles,
  }
}
