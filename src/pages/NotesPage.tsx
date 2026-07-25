import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NoteList } from '../components/notes/NoteList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useNotes } from '../hooks/useNotes'
import type { NoteDocument, NotesFilter } from '../types/note'
import { AppLayout } from '../layouts/AppLayout'
import { ROUTES } from '../constants/routes'
import { purgeEmptyNoteDrafts } from '../utils/noteStorage'
import { deleteAllNoteMedia } from '../services/noteMediaService'
import { cancelTaskReminder, rescheduleAllTaskReminders, syncTaskReminder } from '../services/taskReminderService'
import '../styles/notes-page.css'

const FILTERS: Array<{ id: NotesFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'pinned', label: 'Pinned' },
]

export function NotesPage() {
  const navigate = useNavigate()
  const {
    ownerKey,
    visibleNotes,
    query,
    setQuery,
    filter,
    setFilter,
    createNote,
    saveNote,
    removeNote,
    refresh,
  } = useNotes()
  const [noteToDelete, setNoteToDelete] = useState<NoteDocument | null>(null)

  useEffect(() => {
    const removed = purgeEmptyNoteDrafts(ownerKey)
    if (removed.length > 0) {
      removed.forEach((id) => {
        void deleteAllNoteMedia(ownerKey, id)
        void cancelTaskReminder(id)
      })
      refresh()
    }
    void rescheduleAllTaskReminders(ownerKey)
  }, [ownerKey, refresh])

  function handleAdd() {
    const note = createNote({ title: '', kind: 'note' })
    navigate(`${ROUTES.NOTES}/${note.id}`)
  }

  return (
    <AppLayout
      title="My Notes"
      subtitle="Private notes and tasks on this device."
      showBrand
      align="top"
    >
      <div className="notes-page">
        <label className="notes-search">
          <span className="sr-only">Search notes and tasks</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search notes and tasks"
          />
        </label>

        <div className="notes-filters" role="tablist" aria-label="Filter notes">
          {FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={filter === entry.id}
              className={`notes-filters__chip${filter === entry.id ? ' is-active' : ''}`}
              onClick={() => setFilter(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <button type="button" className="app-btn-primary notes-page__add" onClick={handleAdd}>
          <span className="notes-page__add-icon" aria-hidden="true">
            +
          </span>
          Add new
        </button>

        <NoteList
          notes={visibleNotes}
          onOpen={(note) => navigate(`${ROUTES.NOTES}/${note.id}`)}
          onToggleTaskComplete={(note) => {
            const saved = saveNote(note.id, { completed: !note.completed })
            if (saved) void syncTaskReminder(saved)
          }}
          onDelete={setNoteToDelete}
        />
      </div>

      <ConfirmDialog
        open={noteToDelete !== null}
        title="Delete note?"
        message={
          noteToDelete
            ? `"${noteToDelete.title || 'Untitled'}" will be permanently removed from this device.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!noteToDelete) return
          void (async () => {
            await cancelTaskReminder(noteToDelete.id)
            await deleteAllNoteMedia(ownerKey, noteToDelete.id)
            removeNote(noteToDelete.id)
            setNoteToDelete(null)
          })()
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </AppLayout>
  )
}
