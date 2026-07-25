import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../constants/auth'
import {
  clearStoredNotes,
  createNoteDocument,
  deleteNote,
  ensureNotesMigrated,
  getNoteById,
  getStoredNotes,
  noteMatchesQuery,
  notesOwnerKey,
  notesStorageKey,
  saveNoteDocument,
} from './noteStorage'
import { emptyChecklist, emptyParagraph, setBlockText } from './noteBlocks'

describe('noteStorage v2', () => {
  const owner = notesOwnerKey('admin@example.com')

  beforeEach(() => {
    localStorage.clear()
  })

  it('creates and lists notes scoped by owner', () => {
    createNoteDocument(owner, { title: 'First' })
    const other = notesOwnerKey('other@example.com')
    createNoteDocument(other, { title: 'Secret' })

    const notes = getStoredNotes(owner)
    expect(notes).toHaveLength(1)
    expect(notes[0].title).toBe('First')
    expect(notes[0].schemaVersion).toBe(2)
    expect(getStoredNotes(other)).toHaveLength(1)
  })

  it('migrates legacy plain notes once', () => {
    localStorage.setItem(
      STORAGE_KEYS.NOTES,
      JSON.stringify([
        {
          id: 'legacy-1',
          title: 'Old note',
          body: 'Line one\nLine two',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ]),
    )

    ensureNotesMigrated(owner)
    const notes = getStoredNotes(owner)
    expect(notes).toHaveLength(1)
    expect(notes[0].id).toBe('legacy-1')
    expect(notes[0].title).toBe('Old note')
    expect(notes[0].blocks).toHaveLength(2)

    // Second pass should not duplicate
    ensureNotesMigrated(owner)
    expect(getStoredNotes(owner)).toHaveLength(1)
  })

  it('updates, pins, and deletes notes', () => {
    const note = createNoteDocument(owner, { title: 'Draft' })
    const updated = saveNoteDocument(owner, note.id, {
      title: 'Final',
      pinned: true,
      blocks: [setBlockText(emptyParagraph(), 'Hello')],
    })

    expect(updated?.title).toBe('Final')
    expect(updated?.pinned).toBe(true)
    expect(getNoteById(owner, note.id)?.title).toBe('Final')

    deleteNote(owner, note.id)
    expect(getStoredNotes(owner)).toHaveLength(0)
  })

  it('supports task fields without affecting other owners', () => {
    const note = createNoteDocument(owner, {
      kind: 'task',
      title: 'Pay bill',
      dueDate: '2026-07-26',
      blocks: [emptyChecklist()],
    })

    expect(note.kind).toBe('task')
    expect(note.dueDate).toBe('2026-07-26')
    expect(localStorage.getItem(notesStorageKey(owner))).toContain('Pay bill')
  })

  it('clears scoped and legacy notes', () => {
    createNoteDocument(owner, { title: 'One' })
    localStorage.setItem(STORAGE_KEYS.NOTES, '[]')
    clearStoredNotes()
    expect(getStoredNotes(owner)).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEYS.NOTES)).toBeNull()
  })

  it('matches search across title and block text', () => {
    const note = createNoteDocument(owner, {
      title: 'Groceries',
      blocks: [setBlockText(emptyParagraph(), 'Buy oat milk')],
    })
    expect(noteMatchesQuery(note, 'oat')).toBe(true)
    expect(noteMatchesQuery(note, 'electric')).toBe(false)
  })
})
