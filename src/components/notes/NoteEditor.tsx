import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { NoteBlock, NoteDocument, NoteDraftInput } from '../../types/note'
import {
  attachmentBlock,
  blockHasMark,
  blockToPlainText,
  countMediaBlocks,
  createBlockId,
  emptyBullet,
  emptyChecklist,
  emptyParagraph,
  imageBlock,
  isMediaBlock,
  isTextBlock,
  setBlockText,
  toBullet,
  toChecklist,
  toParagraph,
  toggleBlockMark,
} from '../../utils/noteBlocks'
import {
  NOTE_MEDIA_LIMITS,
  NoteMediaError,
  deleteNoteMediaFile,
  formatBytes,
  readNoteMediaDataUrl,
  saveNoteMediaFile,
} from '../../services/noteMediaService'
import { ConvertToTaskSheet, type TaskDetailsValue } from './ConvertToTaskSheet'
import { EditorToolbar } from './EditorToolbar'

interface NoteEditorProps {
  note: NoteDocument
  onChange: (patch: NoteDraftInput) => void
  onWritingChange?: (writing: boolean) => void
  onRequestDelete?: () => void
  onRequestConvertToHabit?: () => void
}

interface EditorSnapshot {
  title: string
  blocks: NoteBlock[]
}

const HISTORY_LIMIT = 60

function cloneBlocks(blocks: NoteBlock[]): NoteBlock[] {
  return structuredClone(blocks)
}

function blockPlaceholder(type: NoteBlock['type']): string {
  if (type === 'checklist') return 'To-do'
  if (type === 'bullet') return 'List item'
  return 'Start writing…'
}

function formatTaskDue(dueDate: string): string {
  const due = new Date(`${dueDate}T12:00:00`)
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function NoteEditor({
  note,
  onChange,
  onWritingChange,
  onRequestDelete,
  onRequestConvertToHabit,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [blocks, setBlocks] = useState<NoteBlock[]>(note.blocks)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(note.blocks[0]?.id ?? null)
  const [isWriting, setIsWriting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({})
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [taskSheetMode, setTaskSheetMode] = useState<'convert' | 'edit' | null>(null)
  const skipNextSync = useRef(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const focusBlockIdRef = useRef<string | null>(null)
  const historyRef = useRef<EditorSnapshot[]>([
    { title: note.title, blocks: cloneBlocks(note.blocks) },
  ])
  const historyIndexRef = useRef(0)
  const applyingHistoryRef = useRef(false)

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    setTitle(note.title)
    setBlocks(note.blocks)
  }, [note.id, note.title, note.blocks, note.updatedAt])

  useEffect(() => {
    historyRef.current = [{ title: note.title, blocks: cloneBlocks(note.blocks) }]
    historyIndexRef.current = 0
    setCanUndo(false)
    setCanRedo(false)
    setActiveBlockId(note.blocks[0]?.id ?? null)
  }, [note.id])

  useEffect(() => {
    onWritingChange?.(isWriting)
  }, [isWriting, onWritingChange])

  useEffect(() => {
    const blockId = focusBlockIdRef.current
    if (!blockId) return
    focusBlockIdRef.current = null
    const frame = window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLTextAreaElement>(
        `textarea[data-block-id="${blockId}"]`,
      )
      if (!element) return
      element.focus()
      const end = element.value.length
      element.setSelectionRange(end, end)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [blocks, activeBlockId])

  useEffect(() => {
    if (!previewImage) return

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setPreviewImage(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [previewImage])

  useEffect(() => {
    let cancelled = false
    const mediaBlocks = note.blocks.filter(isMediaBlock)

    void (async () => {
      const next: Record<string, string> = {}
      for (const block of mediaBlocks) {
        if (block.type !== 'image') continue
        try {
          next[block.media.fileId] = await readNoteMediaDataUrl(block.media.relativePath)
        } catch {
          // Preview may fail if file was cleaned up.
        }
      }
      if (!cancelled) setMediaUrls(next)
    })()

    return () => {
      cancelled = true
    }
  }, [note.blocks, note.id])

  const activeBlock = useMemo(
    () => blocks.find((block) => block.id === activeBlockId) ?? null,
    [blocks, activeBlockId],
  )

  function syncHistoryFlags() {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }

  function pushHistory(nextTitle: string, nextBlocks: NoteBlock[]) {
    if (applyingHistoryRef.current) return
    const stack = historyRef.current.slice(0, historyIndexRef.current + 1)
    const last = stack[stack.length - 1]
    if (
      last &&
      last.title === nextTitle &&
      JSON.stringify(last.blocks) === JSON.stringify(nextBlocks)
    ) {
      return
    }
    stack.push({ title: nextTitle, blocks: cloneBlocks(nextBlocks) })
    if (stack.length > HISTORY_LIMIT) {
      stack.shift()
    }
    historyRef.current = stack
    historyIndexRef.current = stack.length - 1
    syncHistoryFlags()
  }

  function commitBlocks(next: NoteBlock[], options?: { focusId?: string | null }) {
    const ensured = next.length > 0 ? next : [emptyParagraph()]
    skipNextSync.current = true
    setBlocks(ensured)
    onChange({ blocks: ensured })
    pushHistory(title, ensured)
    if (options && 'focusId' in options) {
      const focusId = options.focusId
      if (focusId) {
        focusBlockIdRef.current = focusId
        setActiveBlockId(focusId)
      }
    }
  }

  function commitTitle(nextTitle: string) {
    skipNextSync.current = true
    setTitle(nextTitle)
    onChange({ title: nextTitle })
    pushHistory(nextTitle, blocks)
  }

  function updateBlock(blockId: string, updater: (block: NoteBlock) => NoteBlock) {
    commitBlocks(blocks.map((block) => (block.id === blockId ? updater(block) : block)))
  }

  function insertBlockAfter(blockId: string | null, block: NoteBlock) {
    if (!blockId) {
      commitBlocks([...blocks, block], { focusId: block.id })
      return
    }
    const index = blocks.findIndex((entry) => entry.id === blockId)
    if (index === -1) {
      commitBlocks([...blocks, block], { focusId: block.id })
      return
    }
    const next = [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)]
    commitBlocks(next, { focusId: block.id })
  }

  function replaceActiveTextBlock(transform: (block: NoteBlock) => NoteBlock) {
    const targetId = activeBlockId ?? blocks[blocks.length - 1]?.id
    if (!targetId) return null
    const current = blocks.find((block) => block.id === targetId)
    if (!current || !isTextBlock(current)) return null
    commitBlocks(
      blocks.map((block) => (block.id === targetId ? transform(block) : block)),
      { focusId: targetId },
    )
    return targetId
  }

  function handleChecklist() {
    const targetId = activeBlockId ?? blocks[blocks.length - 1]?.id
    if (!targetId) {
      insertBlockAfter(null, emptyChecklist())
      return
    }
    const current = blocks.find((block) => block.id === targetId)
    if (current && isTextBlock(current)) {
      if (current.type === 'checklist') {
        replaceActiveTextBlock(toParagraph)
        return
      }
      replaceActiveTextBlock((block) => toChecklist(block))
      return
    }
    insertBlockAfter(targetId, emptyChecklist())
  }

  function handleBullet() {
    const targetId = activeBlockId ?? blocks[blocks.length - 1]?.id
    if (!targetId) {
      insertBlockAfter(null, emptyBullet())
      return
    }
    const current = blocks.find((block) => block.id === targetId)
    if (current && isTextBlock(current)) {
      if (current.type === 'bullet') {
        replaceActiveTextBlock(toParagraph)
        return
      }
      replaceActiveTextBlock(toBullet)
      return
    }
    insertBlockAfter(targetId, emptyBullet())
  }

  function handleBold() {
    if (!activeBlock || !isTextBlock(activeBlock)) return
    updateBlock(activeBlock.id, (block) => toggleBlockMark(block, 'bold'))
  }

  function applySnapshot(snapshot: EditorSnapshot) {
    applyingHistoryRef.current = true
    skipNextSync.current = true
    setTitle(snapshot.title)
    setBlocks(snapshot.blocks)
    onChange({ title: snapshot.title, blocks: snapshot.blocks })
    applyingHistoryRef.current = false
    syncHistoryFlags()
  }

  function handleUndo() {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    const snapshot = historyRef.current[historyIndexRef.current]
    if (snapshot) applySnapshot(snapshot)
  }

  function handleRedo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const snapshot = historyRef.current[historyIndexRef.current]
    if (snapshot) applySnapshot(snapshot)
  }

  async function handlePickedFile(file: File | undefined, kind: 'image' | 'attachment') {
    if (!file) return
    setMediaError(null)

    if (countMediaBlocks(blocks) >= NOTE_MEDIA_LIMITS.maxMediaPerNote) {
      setMediaError(`You can add up to ${NOTE_MEDIA_LIMITS.maxMediaPerNote} files per note.`)
      return
    }

    try {
      const media = await saveNoteMediaFile({
        ownerKey: note.ownerKey,
        noteId: note.id,
        file,
        kind,
      })
      const block = kind === 'image' ? imageBlock(media) : attachmentBlock(media)
      insertBlockAfter(activeBlockId ?? blocks[blocks.length - 1]?.id ?? null, block)
      if (kind === 'image') {
        const url = await readNoteMediaDataUrl(media.relativePath)
        setMediaUrls((current) => ({ ...current, [media.fileId]: url }))
      }
    } catch (error) {
      setMediaError(error instanceof NoteMediaError ? error.message : 'Could not add that file.')
    }
  }

  async function removeMediaBlock(blockId: string) {
    const block = blocks.find((entry) => entry.id === blockId)
    if (!block || !isMediaBlock(block)) return
    await deleteNoteMediaFile(block.media.relativePath)
    commitBlocks(blocks.filter((entry) => entry.id !== blockId))
    setMediaUrls((current) => {
      const next = { ...current }
      delete next[block.media.fileId]
      return next
    })
  }

  function handleDone() {
    setIsWriting(false)
    setMenuOpen(false)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  function handleTaskSheetSave(value: TaskDetailsValue) {
    if (taskSheetMode === 'convert') {
      onChange({
        kind: 'task',
        dueDate: value.dueDate,
        reminderEnabled: value.reminderEnabled,
        reminderTime: value.reminderTime,
      })
    } else {
      onChange({
        dueDate: value.dueDate,
        reminderEnabled: value.reminderEnabled,
        reminderTime: value.reminderTime,
      })
    }
    setTaskSheetMode(null)
  }

  function handleBlockKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
    block: NoteBlock,
  ) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      if (event.shiftKey) handleRedo()
      else handleUndo()
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      handleRedo()
      return
    }

    if (!isTextBlock(block)) return

    const text = blockToPlainText(block)
    const isEmpty = text.trim() === ''

    if (event.key === 'Enter') {
      event.preventDefault()
      if (isEmpty && (block.type === 'bullet' || block.type === 'checklist')) {
        commitBlocks(
          blocks.map((entry) => (entry.id === block.id ? toParagraph(entry) : entry)),
          { focusId: block.id },
        )
        return
      }
      const next =
        block.type === 'checklist'
          ? emptyChecklist()
          : block.type === 'bullet'
            ? emptyBullet()
            : emptyParagraph()
      insertBlockAfter(block.id, next)
      return
    }

    if (event.key === 'Backspace') {
      const target = event.currentTarget
      const atStart = target.selectionStart === 0 && target.selectionEnd === 0
      if (!atStart) return

      if (block.type === 'bullet' || block.type === 'checklist') {
        event.preventDefault()
        commitBlocks(
          blocks.map((entry) => (entry.id === block.id ? toParagraph(entry) : entry)),
          { focusId: block.id },
        )
        return
      }

      if (block.type === 'paragraph' && isEmpty && blocks.length > 1) {
        event.preventDefault()
        const index = blocks.findIndex((entry) => entry.id === block.id)
        const next = blocks.filter((entry) => entry.id !== block.id)
        const focusId = next[Math.max(0, index - 1)]?.id ?? next[0]?.id ?? null
        commitBlocks(next, { focusId })
      }
    }
  }

  return (
    <div className={`note-editor${isWriting ? ' note-editor--writing' : ''}`}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          void handlePickedFile(file, 'image')
        }}
      />
      <input
        ref={attachInputRef}
        type="file"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          void handlePickedFile(file, 'attachment')
        }}
      />

      <div className="note-editor__topbar">
        <div className="note-editor__topbar-spacer" />
        {isWriting ? (
          <button type="button" className="note-editor__done" onClick={handleDone}>
            Done
          </button>
        ) : (
          <div className="note-editor__actions">
            <div className="note-editor__menu-wrap">
              <button
                type="button"
                className="note-editor__icon-btn"
                aria-label="More actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreIcon />
              </button>
              {menuOpen ? (
                <div className="note-editor__menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onChange({ pinned: !note.pinned })
                      setMenuOpen(false)
                    }}
                  >
                    {note.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  {note.kind === 'note' ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setTaskSheetMode('convert')
                      }}
                    >
                      Convert to task…
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          setTaskSheetMode('edit')
                        }}
                      >
                        Due & reminder…
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onChange({
                            kind: 'note',
                            reminderEnabled: false,
                          })
                          setMenuOpen(false)
                        }}
                      >
                        Convert to note
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpen(false)
                          onRequestConvertToHabit?.()
                        }}
                      >
                        Convert to habit…
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onChange({ shareWithCoach: !note.shareWithCoach })
                      setMenuOpen(false)
                    }}
                  >
                    {note.shareWithCoach ? 'Stop sharing with Coach' : 'Share with Coach'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="is-danger"
                    onClick={() => {
                      setMenuOpen(false)
                      onRequestDelete?.()
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="note-editor__meta">
        {note.kind === 'task' ? (
          <button
            type="button"
            className="note-editor__task-chip"
            onClick={() => setTaskSheetMode('edit')}
          >
            <span>Task</span>
            {note.dueDate ? <span>· Due {formatTaskDue(note.dueDate)}</span> : null}
            {note.reminderEnabled ? <span>· Reminder</span> : null}
          </button>
        ) : null}
        <p className="note-editor__saved">Autosaved</p>
        {mediaError ? (
          <p className="note-editor__error" role="alert">
            {mediaError}
          </p>
        ) : null}
      </div>

      <input
        className="note-editor__title"
        value={title}
        placeholder="Title"
        aria-label="Title"
        onChange={(event) => commitTitle(event.target.value)}
        onFocus={() => setIsWriting(true)}
      />

      <div className="note-editor__blocks">
        {blocks.map((block) => {
          if (block.type === 'image') {
            const previewSrc = mediaUrls[block.media.fileId]
            return (
              <div key={block.id} className="note-editor__media note-editor__media--image">
                {previewSrc ? (
                  <button
                    type="button"
                    className="note-editor__media-thumb"
                    onClick={() =>
                      setPreviewImage({ src: previewSrc, name: block.media.fileName })
                    }
                    aria-label={`Preview ${block.media.fileName}`}
                  >
                    <img src={previewSrc} alt={block.media.fileName} />
                  </button>
                ) : (
                  <div className="note-editor__media-fallback">{block.media.fileName}</div>
                )}
                <div className="note-editor__media-meta">
                  <span>{block.media.fileName}</span>
                  <button type="button" onClick={() => void removeMediaBlock(block.id)}>
                    Remove
                  </button>
                </div>
              </div>
            )
          }

          if (block.type === 'attachment') {
            return (
              <div key={block.id} className="note-editor__media note-editor__media--file">
                <div className="note-editor__media-meta">
                  <span>
                    {block.media.fileName} · {formatBytes(block.media.sizeBytes)}
                  </span>
                  <button type="button" onClick={() => void removeMediaBlock(block.id)}>
                    Remove
                  </button>
                </div>
              </div>
            )
          }

          const text = blockToPlainText(block)
          const bold = blockHasMark(block, 'bold')
          const italic = blockHasMark(block, 'italic')

          return (
            <div key={block.id} className={`note-editor__block note-editor__block--${block.type}`}>
              {block.type === 'checklist' ? (
                <button
                  type="button"
                  className={`note-editor__check${block.checked ? ' is-checked' : ''}`}
                  aria-label={block.checked ? 'Mark incomplete' : 'Mark complete'}
                  onClick={() =>
                    updateBlock(block.id, (current) =>
                      current.type === 'checklist'
                        ? { ...current, checked: !current.checked }
                        : current,
                    )
                  }
                />
              ) : null}
              {block.type === 'bullet' ? <span className="note-editor__bullet" aria-hidden="true" /> : null}
              <textarea
                data-block-id={block.id}
                className={`note-editor__input${bold ? ' is-bold' : ''}${italic ? ' is-italic' : ''}`}
                value={text}
                rows={1}
                aria-label="Note content"
                placeholder={blockPlaceholder(block.type)}
                onFocus={() => {
                  setActiveBlockId(block.id)
                  setIsWriting(true)
                }}
                onChange={(event) => {
                  const value = event.target.value
                  updateBlock(block.id, (current) => setBlockText(current, value))
                  event.target.style.height = 'auto'
                  event.target.style.height = `${event.target.scrollHeight}px`
                }}
                onKeyDown={(event) => handleBlockKeyDown(event, block)}
                ref={(element) => {
                  if (element) {
                    element.style.height = 'auto'
                    element.style.height = `${element.scrollHeight}px`
                  }
                }}
              />
            </div>
          )
        })}

        <button
          type="button"
          className="note-editor__add-block"
          onClick={() => {
            const block = { ...emptyParagraph(), id: createBlockId() }
            commitBlocks([...blocks, block], { focusId: block.id })
            setIsWriting(true)
          }}
        >
          + Add line
        </button>
      </div>

      <EditorToolbar
        visible={isWriting}
        boldActive={activeBlock && isTextBlock(activeBlock) ? blockHasMark(activeBlock, 'bold') : false}
        bulletActive={activeBlock?.type === 'bullet'}
        checklistActive={activeBlock?.type === 'checklist'}
        canUndo={canUndo}
        canRedo={canRedo}
        onChecklist={handleChecklist}
        onBullet={handleBullet}
        onBold={handleBold}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <ConvertToTaskSheet
        open={taskSheetMode !== null}
        mode={taskSheetMode ?? 'convert'}
        initial={{
          dueDate: note.dueDate,
          reminderEnabled: note.reminderEnabled,
          reminderTime: note.reminderTime,
        }}
        onSave={handleTaskSheetSave}
        onCancel={() => setTaskSheetMode(null)}
      />

      {previewImage
        ? createPortal(
            <div
              className="note-image-preview"
              role="dialog"
              aria-modal="true"
              aria-label={`Preview ${previewImage.name}`}
              onClick={() => setPreviewImage(null)}
            >
              <button
                type="button"
                className="note-image-preview__close"
                aria-label="Close preview"
                onClick={() => setPreviewImage(null)}
              >
                Close
              </button>
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="note-image-preview__image"
                onClick={(event) => event.stopPropagation()}
              />
              <p className="note-image-preview__name">{previewImage.name}</p>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="19" r="1.7" fill="currentColor" />
    </svg>
  )
}
