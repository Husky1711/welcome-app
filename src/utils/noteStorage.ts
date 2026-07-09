import { STORAGE_KEYS } from '../constants/auth'
import type { Note, NoteInput } from '../types/note'

function generateId(): string {
  return crypto.randomUUID()
}

export function getStoredNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES)
    if (!raw) return []

    const parsed = JSON.parse(raw) as Note[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (note) =>
        typeof note.id === 'string' &&
        typeof note.title === 'string' &&
        typeof note.body === 'string',
    )
  } catch {
    return []
  }
}

function saveNotes(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
}

export function addNote(input: NoteInput): Note {
  const now = new Date().toISOString()
  const note: Note = {
    id: generateId(),
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: now,
    updatedAt: now,
  }

  const notes = getStoredNotes()
  saveNotes([note, ...notes])
  return note
}

export function updateNote(id: string, input: NoteInput): Note | null {
  const notes = getStoredNotes()
  const index = notes.findIndex((note) => note.id === id)
  if (index === -1) return null

  const updated: Note = {
    ...notes[index],
    title: input.title.trim(),
    body: input.body.trim(),
    updatedAt: new Date().toISOString(),
  }

  notes[index] = updated
  saveNotes(notes)
  return updated
}

export function deleteNote(id: string): boolean {
  const notes = getStoredNotes()
  const filtered = notes.filter((note) => note.id !== id)
  if (filtered.length === notes.length) return false

  saveNotes(filtered)
  return true
}

export function clearStoredNotes(): void {
  localStorage.removeItem(STORAGE_KEYS.NOTES)
}
