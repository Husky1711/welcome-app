import { describe, expect, it } from 'vitest'
import { getTaskNotificationId, getTaskReminderFireDate } from '../services/taskReminderService'
import { getHabitNotificationId } from '../services/habitReminderService'
import { convertTaskToHabit } from '../utils/convertTaskToHabit'
import { isEmptyDraft } from '../utils/noteBlocks'
import { emptyParagraph, setBlockText } from '../utils/noteBlocks'
import type { NoteDocument } from '../types/note'

function sampleTask(overrides: Partial<NoteDocument> = {}): NoteDocument {
  return {
    id: 'task-1',
    ownerKey: 'admin@example.com',
    kind: 'task',
    title: 'Walk daily',
    blocks: [setBlockText(emptyParagraph(), 'Evening walk')],
    pinned: false,
    completed: false,
    dueDate: '2026-07-26',
    reminderEnabled: true,
    reminderTime: '09:00',
    shareWithCoach: false,
    createdAt: '2026-07-25T00:00:00.000Z',
    updatedAt: '2026-07-25T00:00:00.000Z',
    schemaVersion: 2,
    ...overrides,
  }
}

describe('task reminders and convert', () => {
  it('uses notification ids outside the habit range', () => {
    const habitId = getHabitNotificationId('habit-abc')
    const taskId = getTaskNotificationId('habit-abc')
    expect(taskId).toBeGreaterThanOrEqual(2_000_000)
    expect(taskId).not.toBe(habitId)
  })

  it('builds a due-date fire time', () => {
    const at = getTaskReminderFireDate('2026-07-26', '18:30')
    expect(at?.getFullYear()).toBe(2026)
    expect(at?.getMonth()).toBe(6)
    expect(at?.getDate()).toBe(26)
    expect(at?.getHours()).toBe(18)
    expect(at?.getMinutes()).toBe(30)
  })

  it('converts a task into a habit without deleting the task fields', () => {
    const habit = convertTaskToHabit(sampleTask())
    expect(habit.title).toBe('Walk daily')
    expect(habit.reminderEnabled).toBe(false)
  })

  it('detects empty drafts', () => {
    expect(
      isEmptyDraft({
        title: '',
        blocks: [emptyParagraph()],
        pinned: false,
        kind: 'note',
        dueDate: null,
      }),
    ).toBe(true)

    expect(
      isEmptyDraft({
        title: 'Saved',
        blocks: [emptyParagraph()],
        pinned: false,
        kind: 'note',
        dueDate: null,
      }),
    ).toBe(false)
  })
})
