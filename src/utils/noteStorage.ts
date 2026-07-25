import { STORAGE_KEYS } from '../constants/auth'
import type { LegacyNote, NoteBlock, NoteDocument, NoteDraftInput, NoteKind } from '../types/note'
import {
  documentToPlainText,
  emptyParagraph,
  ensureBlocks,
  isEmptyDraft,
  plainSpans,
} from './noteBlocks'

const NOTES_V2_PREFIX = 'welcome_app.notes.v2.'
const MIGRATION_FLAG_PREFIX = 'welcome_app.notes.migrated.v2.'

function generateId(): string {
  return crypto.randomUUID()
}

export function notesOwnerKey(email: string | null | undefined): string {
  const normalized = email?.trim().toLowerCase()
  return normalized && normalized.length > 0 ? normalized : 'local'
}

export function notesStorageKey(ownerKey: string): string {
  return `${NOTES_V2_PREFIX}${ownerKey}`
}

function migrationFlagKey(ownerKey: string): string {
  return `${MIGRATION_FLAG_PREFIX}${ownerKey}`
}

function isBlock(value: unknown): value is NoteBlock {
  if (!value || typeof value !== 'object') return false
  const block = value as NoteBlock
  if (typeof block.id !== 'string') return false
  if (block.type === 'paragraph' || block.type === 'bullet') {
    return Array.isArray(block.spans)
  }
  if (block.type === 'checklist') {
    return typeof block.checked === 'boolean' && Array.isArray(block.spans)
  }
  if (block.type === 'image' || block.type === 'attachment') {
    const media = block.media
    return (
      !!media &&
      typeof media.fileId === 'string' &&
      typeof media.fileName === 'string' &&
      typeof media.mimeType === 'string' &&
      typeof media.sizeBytes === 'number' &&
      typeof media.relativePath === 'string'
    )
  }
  return false
}

function normalizeNote(raw: Partial<NoteDocument> & { id: string; ownerKey: string }): NoteDocument | null {
  if (typeof raw.title !== 'string' || !Array.isArray(raw.blocks)) return null
  if (!raw.blocks.every(isBlock)) return null
  if (raw.kind !== 'note' && raw.kind !== 'task') return null

  return {
    id: raw.id,
    ownerKey: raw.ownerKey,
    kind: raw.kind,
    title: raw.title,
    blocks: ensureBlocks(raw.blocks),
    pinned: Boolean(raw.pinned),
    completed: Boolean(raw.completed),
    dueDate: typeof raw.dueDate === 'string' ? raw.dueDate : null,
    reminderEnabled: Boolean(raw.reminderEnabled),
    reminderTime: typeof raw.reminderTime === 'string' ? raw.reminderTime : null,
    shareWithCoach: Boolean(raw.shareWithCoach),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
    schemaVersion: 2,
  }
}

function readLegacyNotes(): LegacyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LegacyNote[]
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

export function legacyBodyToBlocks(body: string): NoteDocument['blocks'] {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const nonEmpty = lines.length > 0 ? lines : ['']
  return nonEmpty.map((line) => ({
    id: generateId(),
    type: 'paragraph' as const,
    spans: plainSpans(line),
  }))
}

function migrateLegacyNote(legacy: LegacyNote, ownerKey: string): NoteDocument {
  return {
    id: legacy.id,
    ownerKey,
    kind: 'note',
    title: legacy.title,
    blocks: legacyBodyToBlocks(legacy.body),
    pinned: false,
    completed: false,
    dueDate: null,
    reminderEnabled: false,
    reminderTime: null,
    shareWithCoach: false,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    schemaVersion: 2,
  }
}

function readScopedNotes(ownerKey: string): NoteDocument[] {
  try {
    const raw = localStorage.getItem(notesStorageKey(ownerKey))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null
        const candidate = entry as Partial<NoteDocument>
        if (typeof candidate.id !== 'string') return null
        return normalizeNote({ ...candidate, id: candidate.id, ownerKey })
      })
      .filter((note): note is NoteDocument => note !== null)
  } catch {
    return []
  }
}

function writeScopedNotes(ownerKey: string, notes: NoteDocument[]): void {
  localStorage.setItem(notesStorageKey(ownerKey), JSON.stringify(notes))
}

export function ensureNotesMigrated(ownerKey: string): void {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(migrationFlagKey(ownerKey)) === '1') return

  const existing = readScopedNotes(ownerKey)
  const legacy = readLegacyNotes()

  if (existing.length === 0 && legacy.length > 0) {
    writeScopedNotes(
      ownerKey,
      legacy.map((note) => migrateLegacyNote(note, ownerKey)),
    )
  }

  localStorage.setItem(migrationFlagKey(ownerKey), '1')
}

export function getStoredNotes(ownerKey: string): NoteDocument[] {
  ensureNotesMigrated(ownerKey)
  return readScopedNotes(ownerKey).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function getNoteById(ownerKey: string, id: string): NoteDocument | null {
  return getStoredNotes(ownerKey).find((note) => note.id === id) ?? null
}

export function createNoteDocument(
  ownerKey: string,
  input: NoteDraftInput = {},
): NoteDocument {
  const now = new Date().toISOString()
  const kind: NoteKind = input.kind ?? 'note'
  const note: NoteDocument = {
    id: generateId(),
    ownerKey,
    kind,
    title: (input.title ?? '').trim(),
    blocks: ensureBlocks(input.blocks ?? [emptyParagraph()]),
    pinned: input.pinned ?? false,
    completed: input.completed ?? false,
    dueDate: input.dueDate ?? null,
    reminderEnabled: input.reminderEnabled ?? false,
    reminderTime: input.reminderTime ?? null,
    shareWithCoach: input.shareWithCoach ?? false,
    createdAt: now,
    updatedAt: now,
    schemaVersion: 2,
  }

  const notes = readScopedNotes(ownerKey)
  writeScopedNotes(ownerKey, [note, ...notes])
  return note
}

export function saveNoteDocument(
  ownerKey: string,
  id: string,
  patch: NoteDraftInput,
): NoteDocument | null {
  const notes = readScopedNotes(ownerKey)
  const index = notes.findIndex((note) => note.id === id)
  if (index === -1) return null

  const current = notes[index]
  const updated: NoteDocument = {
    ...current,
    kind: patch.kind ?? current.kind,
    title: patch.title !== undefined ? patch.title.trim() : current.title,
    blocks: patch.blocks ? ensureBlocks(patch.blocks) : current.blocks,
    pinned: patch.pinned ?? current.pinned,
    completed: patch.completed ?? current.completed,
    dueDate: patch.dueDate !== undefined ? patch.dueDate : current.dueDate,
    reminderEnabled: patch.reminderEnabled ?? current.reminderEnabled,
    reminderTime: patch.reminderTime !== undefined ? patch.reminderTime : current.reminderTime,
    shareWithCoach: patch.shareWithCoach ?? current.shareWithCoach,
    updatedAt: new Date().toISOString(),
  }

  notes[index] = updated
  writeScopedNotes(ownerKey, notes)
  return updated
}

export function deleteNote(ownerKey: string, id: string): boolean {
  const notes = readScopedNotes(ownerKey)
  const filtered = notes.filter((note) => note.id !== id)
  if (filtered.length === notes.length) return false
  writeScopedNotes(ownerKey, filtered)
  return true
}

/** Removes empty untitled drafts except an optional keepId (active editor). */
export function purgeEmptyNoteDrafts(ownerKey: string, keepId?: string): string[] {
  const notes = readScopedNotes(ownerKey)
  const removedIds: string[] = []
  const kept = notes.filter((note) => {
    if (keepId && note.id === keepId) return true
    if (!isEmptyDraft(note)) return true
    removedIds.push(note.id)
    return false
  })
  if (removedIds.length > 0) {
    writeScopedNotes(ownerKey, kept)
  }
  return removedIds
}

export function clearStoredNotes(ownerKey?: string): void {
  localStorage.removeItem(STORAGE_KEYS.NOTES)

  if (ownerKey) {
    localStorage.removeItem(notesStorageKey(ownerKey))
    localStorage.removeItem(migrationFlagKey(ownerKey))
    return
  }

  const keysToRemove: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key) continue
    if (key.startsWith(NOTES_V2_PREFIX) || key.startsWith(MIGRATION_FLAG_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

export function noteMatchesQuery(note: NoteDocument, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  const haystack = `${note.title}\n${documentToPlainText(note)}`.toLowerCase()
  return haystack.includes(normalized)
}

/** @deprecated Use createNoteDocument */
export function addNote(
  input: { title: string; body: string },
  ownerKey = notesOwnerKey(null),
): NoteDocument {
  return createNoteDocument(ownerKey, {
    title: input.title,
    blocks: legacyBodyToBlocks(input.body),
  })
}

/** @deprecated Use saveNoteDocument */
export function updateNote(
  id: string,
  input: { title: string; body: string },
  ownerKey = notesOwnerKey(null),
): NoteDocument | null {
  return saveNoteDocument(ownerKey, id, {
    title: input.title,
    blocks: legacyBodyToBlocks(input.body),
  })
}
