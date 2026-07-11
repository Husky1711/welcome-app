import type { Note } from '../../types/note'

interface NoteListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="note-empty">
        <p>No notes yet. Create your first private note.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="note-card">
          <h3 className="note-card__title">{note.title}</h3>
          <p className="note-card__body">{note.body}</p>
          <p className="note-card__meta">Updated {formatDate(note.updatedAt)}</p>

          <div className="note-card__actions">
            <button
              type="button"
              className="app-btn-outline"
              onClick={() => onEdit(note)}
              aria-label={`Edit note ${note.title}`}
            >
              Edit
            </button>
            <button
              type="button"
              className="app-btn-outline app-btn-outline--danger"
              onClick={() => onDelete(note)}
              aria-label={`Delete note ${note.title}`}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
