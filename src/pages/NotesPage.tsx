import { useState } from 'react'
import { NoteForm } from '../components/notes/NoteForm'
import { NoteList } from '../components/notes/NoteList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useNotes } from '../hooks/useNotes'
import type { Note } from '../types/note'
import { AppLayout } from '../layouts/AppLayout'
import '../styles/notes-page.css'

export function NotesPage() {
  const { notes, createNote, editNote, removeNote } = useNotes()
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  function handleCreate(title: string, body: string) {
    createNote({ title, body })
    setIsCreating(false)
  }

  function handleEdit(title: string, body: string) {
    if (!editingNote) return

    editNote(editingNote.id, { title, body })
    setEditingNote(null)
  }

  function handleConfirmDelete() {
    if (!noteToDelete) return

    removeNote(noteToDelete.id)
    if (editingNote?.id === noteToDelete.id) {
      setEditingNote(null)
    }
    setNoteToDelete(null)
  }

  return (
    <AppLayout
      title="My Notes"
      subtitle="Private notes stored only on this device."
      showBrand
      align="top"
    >
      <div className="notes-page">
        {isCreating ? (
          <div className="note-form-card">
            <NoteForm
              submitLabel="Add note"
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : editingNote ? (
          <div className="note-form-card">
            <NoteForm
              initialTitle={editingNote.title}
              initialBody={editingNote.body}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditingNote(null)}
            />
          </div>
        ) : (
          <button
            type="button"
            className="app-btn-primary notes-page__add"
            onClick={() => setIsCreating(true)}
          >
            Add new note
          </button>
        )}

        <NoteList
          notes={notes}
          onEdit={setEditingNote}
          onDelete={(note) => setNoteToDelete(note)}
        />
      </div>

      <ConfirmDialog
        open={noteToDelete !== null}
        title="Delete note?"
        message={
          noteToDelete
            ? `"${noteToDelete.title}" will be permanently removed from this device.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </AppLayout>
  )
}
