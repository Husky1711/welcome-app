import { useState } from 'react'
import { NoteForm } from '../components/notes/NoteForm'
import { NoteList } from '../components/notes/NoteList'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ROUTES } from '../constants/routes'
import { useNotes } from '../hooks/useNotes'
import type { Note } from '../types/note'
import { AppLayout } from '../layouts/AppLayout'

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
    <AppLayout title="My Notes" backTo={ROUTES.WELCOME} align="top">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Private notes stored only on this device.
        </p>

        {isCreating ? (
          <div className="rounded-lg bg-surface p-4 shadow-md">
            <NoteForm
              submitLabel="Add note"
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : editingNote ? (
          <div className="rounded-lg bg-surface p-4 shadow-md">
            <NoteForm
              initialTitle={editingNote.title}
              initialBody={editingNote.body}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditingNote(null)}
            />
          </div>
        ) : (
          <Button fullWidth onClick={() => setIsCreating(true)}>
            Add new note
          </Button>
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
