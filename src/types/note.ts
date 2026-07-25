export type NoteKind = 'note' | 'task'

export type TextMark = 'bold' | 'italic'

export interface TextSpan {
  text: string
  marks?: TextMark[]
}

export interface NoteMediaMeta {
  fileId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  /** Relative path under Capacitor Filesystem Data directory. */
  relativePath: string
}

export type NoteBlock =
  | { id: string; type: 'paragraph'; spans: TextSpan[] }
  | { id: string; type: 'bullet'; spans: TextSpan[] }
  | { id: string; type: 'checklist'; checked: boolean; spans: TextSpan[] }
  | { id: string; type: 'image'; media: NoteMediaMeta; caption?: string }
  | { id: string; type: 'attachment'; media: NoteMediaMeta }

export interface NoteDocument {
  id: string
  ownerKey: string
  kind: NoteKind
  title: string
  blocks: NoteBlock[]
  pinned: boolean
  completed: boolean
  dueDate: string | null
  reminderEnabled: boolean
  reminderTime: string | null
  /** Opt-in only. Coach may read this note when Coach ships; never automatic. */
  shareWithCoach: boolean
  createdAt: string
  updatedAt: string
  schemaVersion: 2
}

/** Legacy v1 note shape kept for migration only. */
export interface LegacyNote {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

/** @deprecated Prefer NoteDocument — kept for gradual call-site updates. */
export type Note = NoteDocument

export interface NoteDraftInput {
  kind?: NoteKind
  title?: string
  blocks?: NoteBlock[]
  pinned?: boolean
  completed?: boolean
  dueDate?: string | null
  reminderEnabled?: boolean
  reminderTime?: string | null
  shareWithCoach?: boolean
}

export type NotesFilter = 'all' | 'notes' | 'tasks' | 'pinned'
