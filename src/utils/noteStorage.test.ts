import { beforeEach, describe, expect, it } from 'vitest'
import {
  addNote,
  clearStoredNotes,
  deleteNote,
  getStoredNotes,
  updateNote,
} from './noteStorage'

describe('noteStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds and lists notes', () => {
    addNote({ title: 'First', body: 'Hello' })
    const notes = getStoredNotes()

    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('First')
    expect(notes[0].body).toBe('Hello')
  })

  it('updates and deletes notes', () => {
    const note = addNote({ title: 'Draft', body: 'Old text' })
    const updated = updateNote(note.id, { title: 'Final', body: 'New text' })

    expect(updated?.title).toBe('Final')

    deleteNote(note.id)
    expect(getStoredNotes()).toHaveLength(0)
  })

  it('clears all notes', () => {
    addNote({ title: 'One', body: 'Two' })
    clearStoredNotes()
    expect(getStoredNotes()).toHaveLength(0)
  })
})
