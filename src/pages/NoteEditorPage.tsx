import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { NoteEditor } from '../components/notes/NoteEditor'
import { BackChevronIcon } from '../components/icons/NavIcons'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'
import type { NoteDocument } from '../types/note'
import {
  createNoteDocument,
  deleteNote,
  getNoteById,
  notesOwnerKey,
  purgeEmptyNoteDrafts,
  saveNoteDocument,
} from '../utils/noteStorage'
import { deleteAllNoteMedia } from '../services/noteMediaService'
import {
  cancelTaskReminder,
  syncTaskReminder,
} from '../services/taskReminderService'
import { ConvertTaskError, convertTaskToHabit } from '../utils/convertTaskToHabit'
import { BottomTabNav } from '../components/layout/BottomTabNav'
import '../styles/notes-page.css'

export function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const ownerKey = notesOwnerKey(user?.email)
  const isNew = noteId === 'new'

  const [note, setNote] = useState<NoteDocument | null>(null)
  const [isWriting, setIsWriting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)
  const [missing, setMissing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) {
      const created = createNoteDocument(ownerKey, { title: '', kind: 'note' })
      navigate(`${ROUTES.NOTES}/${created.id}`, { replace: true })
      return
    }

    if (!noteId) {
      setMissing(true)
      return
    }

    const existing = getNoteById(ownerKey, noteId)
    if (!existing) {
      setMissing(true)
      return
    }
    setNote(existing)
    setMissing(false)
  }, [isNew, noteId, ownerKey, navigate])

  const handleChange = useCallback(
    (patch: Parameters<typeof saveNoteDocument>[2]) => {
      if (!note) return
      const saved = saveNoteDocument(ownerKey, note.id, patch)
      if (saved) {
        setNote(saved)
        void syncTaskReminder(saved)
      }
    },
    [note, ownerKey],
  )

  const titleLabel = useMemo(() => note?.title?.trim() || 'Untitled', [note?.title])

  async function removeNoteFully(target: NoteDocument) {
    await cancelTaskReminder(target.id)
    await deleteAllNoteMedia(ownerKey, target.id)
    deleteNote(ownerKey, target.id)
  }

  if (missing) {
    return (
      <div className="note-editor-page">
        <p className="note-empty">This note could not be found.</p>
        <Link to={ROUTES.NOTES} className="app-btn-primary">
          Back to notes
        </Link>
      </div>
    )
  }

  if (!note) {
    return <div className="note-editor-page note-editor-page--loading" aria-busy="true" />
  }

  return (
    <div className={`note-editor-page${isWriting ? ' note-editor-page--writing' : ''}`}>
      <div className="note-editor-page__header">
        <Link
          to={ROUTES.NOTES}
          className="note-editor-page__back"
          aria-label="Back to notes"
          onClick={() => {
            purgeEmptyNoteDrafts(ownerKey)
          }}
        >
          <BackChevronIcon />
        </Link>
        <p className="note-editor-page__crumb">{titleLabel}</p>
      </div>

      {actionError ? (
        <p className="note-editor__error" role="alert">
          {actionError}
        </p>
      ) : null}

      <NoteEditor
        note={note}
        onChange={handleChange}
        onWritingChange={setIsWriting}
        onRequestDelete={() => setDeleteOpen(true)}
        onRequestConvertToHabit={() => {
          setActionError(null)
          setConvertOpen(true)
        }}
      />

      {!isWriting ? <BottomTabNav /> : null}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete note?"
        message={`"${titleLabel}" will be permanently removed from this device.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          void (async () => {
            await removeNoteFully(note)
            navigate(ROUTES.NOTES, { replace: true })
          })()
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={convertOpen}
        title="Convert to habit?"
        message={`Create a habit named "${titleLabel}"? The task stays in Notes. Habits are separate and recurring.`}
        confirmLabel="Create habit"
        onConfirm={() => {
          try {
            convertTaskToHabit(note)
            setConvertOpen(false)
            navigate(ROUTES.HABITS)
          } catch (error) {
            setConvertOpen(false)
            setActionError(
              error instanceof ConvertTaskError
                ? error.message
                : 'Could not create that habit.',
            )
          }
        }}
        onCancel={() => setConvertOpen(false)}
      />
    </div>
  )
}
