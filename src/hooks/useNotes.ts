import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NoteDocument, NoteDraftInput, NotesFilter } from '../types/note'
import { useAuth } from './useAuth'
import {
  createNoteDocument,
  deleteNote,
  getStoredNotes,
  noteMatchesQuery,
  notesOwnerKey,
  saveNoteDocument,
} from '../utils/noteStorage'

export function useNotes() {
  const { user } = useAuth()
  const ownerKey = notesOwnerKey(user?.email)

  const [notes, setNotes] = useState<NoteDocument[]>(() => getStoredNotes(ownerKey))
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<NotesFilter>('all')

  const refresh = useCallback(() => {
    setNotes(getStoredNotes(ownerKey))
  }, [ownerKey])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createNote = useCallback(
    (input: NoteDraftInput = {}) => {
      const note = createNoteDocument(ownerKey, input)
      refresh()
      return note
    },
    [ownerKey, refresh],
  )

  const saveNote = useCallback(
    (id: string, patch: NoteDraftInput) => {
      const note = saveNoteDocument(ownerKey, id, patch)
      refresh()
      return note
    },
    [ownerKey, refresh],
  )

  const removeNote = useCallback(
    (id: string) => {
      const removed = deleteNote(ownerKey, id)
      refresh()
      return removed
    },
    [ownerKey, refresh],
  )

  const visibleNotes = useMemo(() => {
    return notes.filter((note) => {
      if (!noteMatchesQuery(note, query)) return false
      if (filter === 'notes') return note.kind === 'note'
      if (filter === 'tasks') return note.kind === 'task'
      if (filter === 'pinned') return note.pinned
      return true
    })
  }, [notes, query, filter])

  const openTaskCount = useMemo(
    () => notes.filter((note) => note.kind === 'task' && !note.completed).length,
    [notes],
  )

  return {
    ownerKey,
    notes,
    visibleNotes,
    query,
    setQuery,
    filter,
    setFilter,
    openTaskCount,
    createNote,
    saveNote,
    removeNote,
    refresh,
  }
}
