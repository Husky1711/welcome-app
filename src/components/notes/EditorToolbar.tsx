interface EditorToolbarProps {
  visible: boolean
  boldActive: boolean
  italicActive: boolean
  onChecklist: () => void
  onBullet: () => void
  onBold: () => void
  onItalic: () => void
  onImage: () => void
  onAttach: () => void
  mediaBusy?: boolean
}

export function EditorToolbar({
  visible,
  boldActive,
  italicActive,
  onChecklist,
  onBullet,
  onBold,
  onItalic,
  onImage,
  onAttach,
  mediaBusy = false,
}: EditorToolbarProps) {
  if (!visible) return null

  return (
    <div className="note-editor-toolbar" role="toolbar" aria-label="Formatting">
      <button type="button" className="note-editor-toolbar__btn" onClick={onChecklist} aria-label="Checklist">
        <ChecklistIcon />
      </button>
      <button type="button" className="note-editor-toolbar__btn" onClick={onBullet} aria-label="Bullets">
        <BulletIcon />
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${boldActive ? ' is-active' : ''}`}
        onClick={onBold}
        aria-label="Bold"
        aria-pressed={boldActive}
      >
        <span className="note-editor-toolbar__glyph note-editor-toolbar__glyph--bold">B</span>
      </button>
      <button
        type="button"
        className={`note-editor-toolbar__btn${italicActive ? ' is-active' : ''}`}
        onClick={onItalic}
        aria-label="Italic"
        aria-pressed={italicActive}
      >
        <span className="note-editor-toolbar__glyph note-editor-toolbar__glyph--italic">I</span>
      </button>
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onClick={onImage}
        disabled={mediaBusy}
        aria-label="Add image"
      >
        <ImageIcon />
      </button>
      <button
        type="button"
        className="note-editor-toolbar__btn"
        onClick={onAttach}
        disabled={mediaBusy}
        aria-label="Add attachment"
      >
        <AttachIcon />
      </button>
    </div>
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
