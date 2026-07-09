import { useCallback, useState } from 'react'
import type { Note, NoteInput } from '../types/note'
import {
  addNote,
  deleteNote,
  getStoredNotes,
  updateNote,
} from '../utils/noteStorage'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => getStoredNotes())

  const refresh = useCallback(() => {
    setNotes(getStoredNotes())
  }, [])

  const createNote = useCallback(
    (input: NoteInput) => {
      const note = addNote(input)
      refresh()
      return note
    },
    [refresh],
  )

  const editNote = useCallback(
    (id: string, input: NoteInput) => {
      const note = updateNote(id, input)
      refresh()
      return note
    },
    [refresh],
  )

  const removeNote = useCallback(
    (id: string) => {
      const removed = deleteNote(id)
      refresh()
      return removed
    },
    [refresh],
  )

  return {
    notes,
    createNote,
    editNote,
    removeNote,
    refresh,
  }
}
