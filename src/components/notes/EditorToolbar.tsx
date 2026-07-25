import type { MouseEvent } from 'react'

interface EditorToolbarProps {
  visible: boolean
  boldActive: boolean
  italicActive: boolean
  bulletActive?: boolean
  checklistActive?: boolean
  canUndo?: boolean
  canRedo?: boolean
  onChecklist: () => void
  onBullet: () => void
  onBold: () => void
  onItalic: () => void
  onUndo?: () => void
  onRedo?: () => void
  onImage: () => void
  onAttach: () => void
  mediaBusy?: boolean
}

export function EditorToolbar({
  visible,
  boldActive,
  italicActive,
  bulletActive = false,
  checklistActive = false,
  canUndo = false,
  canRedo = false,
  onChecklist,
  onBullet,
  onBold,
  onItalic,
  onUndo,
  onRedo,
  onImage,
  onAttach,
  mediaBusy = false,
}: EditorToolbarProps) {
  if (!visible) return null

  function keepFocus(event: MouseEvent) {
    event.preventDefault()
  }

  return (
    <div className="note-editor-toolbar" role="toolbar" aria-label="Formatting">
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onMouseDown={keepFocus}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onMouseDown={keepFocus}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
      >
        <RedoIcon />
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${checklistActive ? ' is-active' : ''}`}
        onMouseDown={keepFocus}
        onClick={onChecklist}
        aria-label="Checklist"
        aria-pressed={checklistActive}
      >
        <ChecklistIcon />
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${bulletActive ? ' is-active' : ''}`}
        onMouseDown={keepFocus}
        onClick={onBullet}
        aria-label="Bullets"
        aria-pressed={bulletActive}
      >
        <BulletIcon />
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${boldActive ? ' is-active' : ''}`}
        onMouseDown={keepFocus}
        onClick={onBold}
        aria-label="Bold"
        aria-pressed={boldActive}
      >
        <span className="note-editor-toolbar__glyph note-editor-toolbar__glyph--bold">B</span>
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${italicActive ? ' is-active' : ''}`}
        onMouseDown={keepFocus}
        onClick={onItalic}
        aria-label="Italic"
        aria-pressed={italicActive}
      >
        <span className="note-editor-toolbar__glyph note-editor-toolbar__glyph--italic">I</span>
      </button>
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onMouseDown={keepFocus}
        onClick={onImage}
        disabled={mediaBusy}
        aria-label="Add image"
      >
        <ImageIcon />
      </button>
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onMouseDown={keepFocus}
        onClick={onAttach}
        disabled={mediaBusy}
        aria-label="Add attachment"
      >
        <AttachIcon />
      </button>
    </div>
  )
}

function UndoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 14l-4-4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10h8a5 5 0 110 10h-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 14l4-4-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10h-8a5 5 0 100 10h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChecklistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BulletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="7" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="6" cy="17" r="1.5" fill="currentColor" />
      <path d="M10 7h10M10 12h10M10 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <path d="M4.5 16.5l4.2-4.2a1.5 1.5 0 012.1 0L15 16.5l1.8-1.8a1.5 1.5 0 012.1 0l1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AttachIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 12.5l6.2-6.2a2.8 2.8 0 014 4L10.2 18.8a4 4 0 11-5.7-5.7l8-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
