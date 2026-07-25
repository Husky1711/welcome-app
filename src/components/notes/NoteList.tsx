import { useRef, useState } from 'react'
import type { NoteDocument } from '../../types/note'
import { documentPreview } from '../../utils/noteBlocks'

interface NoteListProps {
  notes: NoteDocument[]
  onOpen: (note: NoteDocument) => void
  onToggleTaskComplete?: (note: NoteDocument) => void
  onDelete?: (note: NoteDocument) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDue(dueDate: string): string {
  const due = new Date(`${dueDate}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (due.toDateString() === today.toDateString()) return 'Due today'
  if (due.toDateString() === tomorrow.toDateString()) return 'Due tomorrow'
  return `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export function NoteList({ notes, onOpen, onToggleTaskComplete, onDelete }: NoteListProps) {
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)
  const startX = useRef(0)

  if (notes.length === 0) {
    return (
      <div className="note-empty">
        <p>No notes yet. Create your first private note.</p>
      </div>
    )
  }

  return (
    <ul className="notes-list">
      {notes.map((note) => {
        const preview = documentPreview(note)
        const isTask = note.kind === 'task'
        const revealed = openSwipeId === note.id

        return (
          <li key={note.id} className="notes-list__item">
            <div className={`note-swipe${revealed ? ' is-open' : ''}`}>
              <button
                type="button"
                className="note-swipe__delete"
                aria-label={`Delete ${note.title || 'untitled note'}`}
                onClick={() => onDelete?.(note)}
              >
                Delete
              </button>
              <button
                type="button"
                className={`note-card note-card--interactive${note.completed ? ' note-card--completed' : ''}`}
                onClick={() => {
                  if (revealed) {
                    setOpenSwipeId(null)
                    return
                  }
                  onOpen(note)
                }}
                onTouchStart={(event) => {
                  startX.current = event.touches[0]?.clientX ?? 0
                }}
                onTouchEnd={(event) => {
                  const endX = event.changedTouches[0]?.clientX ?? startX.current
                  const delta = endX - startX.current
                  if (delta < -56) setOpenSwipeId(note.id)
                  if (delta > 56) setOpenSwipeId(null)
                }}
                aria-label={`Open ${note.title || 'untitled note'}`}
              >
                <div className="note-card__row">
                  {isTask ? (
                    <span
                      className="note-card__check"
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleTaskComplete?.(note)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          event.stopPropagation()
                          onToggleTaskComplete?.(note)
                        }
                      }}
                      role="checkbox"
                      aria-checked={note.completed}
                      tabIndex={0}
                      aria-label={note.completed ? 'Mark task incomplete' : 'Mark task complete'}
                    >
                      <span className={`note-card__check-box${note.completed ? ' is-checked' : ''}`} />
                    </span>
                  ) : null}

                  <span className="note-card__main">
                    <span className="note-card__title-row">
                      <h3 className="note-card__title">{note.title || 'Untitled'}</h3>
                      {note.pinned ? <span className="note-card__pin">Pinned</span> : null}
                      {note.shareWithCoach ? <span className="note-card__pin">Coach</span> : null}
                    </span>
                    {preview ? <p className="note-card__body">{preview}</p> : null}
                    <p className="note-card__meta">
                      {isTask && note.dueDate ? (
                        <span className="note-card__due">{formatDue(note.dueDate)}</span>
                      ) : null}
                      {isTask ? <span>Task</span> : <span>Updated {formatDate(note.updatedAt)}</span>}
                    </p>
                  </span>
                </div>
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
