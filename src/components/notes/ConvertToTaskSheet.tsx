import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface TaskDetailsValue {
  dueDate: string | null
  reminderEnabled: boolean
  reminderTime: string | null
}

interface ConvertToTaskSheetProps {
  open: boolean
  mode: 'convert' | 'edit'
  initial: TaskDetailsValue
  onSave: (value: TaskDetailsValue) => void
  onCancel: () => void
}

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function ConvertToTaskSheet({
  open,
  mode,
  initial,
  onSave,
  onCancel,
}: ConvertToTaskSheetProps) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [dueDate, setDueDate] = useState(initial.dueDate ?? todayIsoDate())
  const [reminderEnabled, setReminderEnabled] = useState(initial.reminderEnabled)
  const [reminderTime, setReminderTime] = useState(initial.reminderTime ?? '09:00')

  useEffect(() => {
    if (!open) return
    setDueDate(initial.dueDate ?? todayIsoDate())
    setReminderEnabled(initial.reminderEnabled)
    setReminderTime(initial.reminderTime ?? '09:00')
    cancelRef.current?.focus()
  }, [open, initial.dueDate, initial.reminderEnabled, initial.reminderTime])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="note-task-sheet"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="note-task-sheet__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="note-task-sheet__title">
          {mode === 'convert' ? 'Convert to task' : 'Due & reminder'}
        </h2>
        <p className="note-task-sheet__hint">
          {mode === 'convert'
            ? 'Add a due date if you want. You can change this later.'
            : 'Update when this task is due.'}
        </p>

        <label className="note-editor__due note-task-sheet__field">
          <span>Due</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>

        <label className="note-editor__reminder-toggle note-task-sheet__field">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => {
              const enabled = event.target.checked
              setReminderEnabled(enabled)
              if (enabled && !dueDate) setDueDate(todayIsoDate())
            }}
          />
          <span>Remind me</span>
        </label>

        {reminderEnabled ? (
          <label className="note-editor__due note-task-sheet__field">
            <span>At</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value || '09:00')}
            />
          </label>
        ) : null}

        <div className="note-task-sheet__actions">
          <button
            ref={cancelRef}
            type="button"
            className="note-task-sheet__btn note-task-sheet__btn--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="note-task-sheet__btn note-task-sheet__btn--primary"
            onClick={() =>
              onSave({
                dueDate: dueDate || null,
                reminderEnabled,
                reminderTime: reminderEnabled ? reminderTime || '09:00' : null,
              })
            }
          >
            {mode === 'convert' ? 'Save as task' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
