import type { Note } from '../../types/note'
import { Button } from '../ui/Button'

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
      <div className="rounded-lg border border-dashed border-gray-300 bg-surface p-6 text-center dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No notes yet. Create your first private note.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-lg border border-gray-200 bg-surface p-4 shadow-sm dark:border-gray-700"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">
                {note.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {note.body}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Updated {formatDate(note.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(note)}
              aria-label={`Edit note ${note.title}`}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-error"
              onClick={() => onDelete(note)}
              aria-label={`Delete note ${note.title}`}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
