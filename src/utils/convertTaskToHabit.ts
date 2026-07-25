import { MAX_HABITS } from '../constants/habits'
import type { Habit } from '../types/habit'
import type { NoteDocument } from '../types/note'
import { addHabit, getActiveHabits } from '../utils/habitStorage'
import { documentToPlainText } from '../utils/noteBlocks'

export class ConvertTaskError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConvertTaskError'
  }
}

/**
 * Explicit user action only: create a habit from a task.
 * Does not delete the task or write habit logs.
 */
export function convertTaskToHabit(task: NoteDocument): Habit {
  if (task.kind !== 'task') {
    throw new ConvertTaskError('Only tasks can be converted to habits.')
  }

  if (getActiveHabits().length >= MAX_HABITS) {
    throw new ConvertTaskError(`You can track up to ${MAX_HABITS} habits.`)
  }

  const title = task.title.trim() || documentToPlainText(task).split('\n')[0]?.trim() || 'New habit'
  return addHabit({
    title: title.slice(0, 80),
    icon: '✅',
    reminderEnabled: false,
  })
}
