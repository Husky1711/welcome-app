import type { NoteBlock, NoteDocument, NoteMediaMeta, TextMark, TextSpan } from '../types/note'

export function createBlockId(): string {
  return crypto.randomUUID()
}

export function plainSpans(text: string, marks?: TextMark[]): TextSpan[] {
  return [{ text, ...(marks && marks.length > 0 ? { marks } : {}) }]
}

export function emptyParagraph(): NoteBlock {
  return { id: createBlockId(), type: 'paragraph', spans: plainSpans('') }
}

export function emptyChecklist(checked = false): NoteBlock {
  return { id: createBlockId(), type: 'checklist', checked, spans: plainSpans('') }
}

export function emptyBullet(): NoteBlock {
  return { id: createBlockId(), type: 'bullet', spans: plainSpans('') }
}

export function imageBlock(media: NoteMediaMeta, caption = ''): NoteBlock {
  return { id: createBlockId(), type: 'image', media, caption }
}

export function attachmentBlock(media: NoteMediaMeta): NoteBlock {
  return { id: createBlockId(), type: 'attachment', media }
}

export function spansToPlainText(spans: TextSpan[]): string {
  return spans.map((span) => span.text).join('')
}

export function blockToPlainText(block: NoteBlock): string {
  if (block.type === 'image') return block.caption?.trim() || block.media.fileName
  if (block.type === 'attachment') return block.media.fileName
  return spansToPlainText(block.spans)
}

export function documentToPlainText(doc: Pick<NoteDocument, 'blocks'>): string {
  return doc.blocks.map(blockToPlainText).filter(Boolean).join('\n')
}

export function documentPreview(doc: Pick<NoteDocument, 'blocks'>, maxLength = 120): string {
  const text = documentToPlainText(doc).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

export interface NoteCardText {
  title: string
  preview: string
  isUntitled: boolean
}

/**
 * Produces scannable card copy without changing the stored note. When a user
 * skips the optional title, the first body line becomes the visual title and
 * is removed from the preview so the card never repeats itself.
 */
export function noteCardText(
  doc: Pick<NoteDocument, 'title' | 'blocks'>,
  maxPreviewLength = 120,
): NoteCardText {
  const storedTitle = doc.title.trim()
  if (storedTitle) {
    return {
      title: storedTitle,
      preview: documentPreview(doc, maxPreviewLength),
      isUntitled: false,
    }
  }

  const lines = documentToPlainText(doc)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const [firstLine, ...remainingLines] = lines
  if (!firstLine) {
    return { title: 'Untitled', preview: '', isUntitled: true }
  }

  const remainingText = remainingLines.join(' ')
  const preview =
    remainingText.length <= maxPreviewLength
      ? remainingText
      : `${remainingText.slice(0, maxPreviewLength - 1).trimEnd()}…`

  return { title: firstLine, preview, isUntitled: false }
}

export function setBlockText(block: NoteBlock, text: string): NoteBlock {
  if (block.type === 'image' || block.type === 'attachment') return block
  const existingMarks = block.spans[0]?.marks
  return {
    ...block,
    spans: plainSpans(text, existingMarks),
  }
}

export function toggleBlockMark(block: NoteBlock, mark: TextMark): NoteBlock {
  if (block.type === 'image' || block.type === 'attachment') return block
  const text = blockToPlainText(block)
  const current = new Set(block.spans[0]?.marks ?? [])
  if (current.has(mark)) {
    current.delete(mark)
  } else {
    current.add(mark)
  }
  const marks = Array.from(current) as TextMark[]
  return {
    ...block,
    spans: plainSpans(text, marks.length > 0 ? marks : undefined),
  }
}

export function blockHasMark(block: NoteBlock, mark: TextMark): boolean {
  if (block.type === 'image' || block.type === 'attachment') return false
  return block.spans[0]?.marks?.includes(mark) ?? false
}

export function isTextBlock(
  block: NoteBlock,
): block is Extract<NoteBlock, { spans: TextSpan[] }> {
  return block.type === 'paragraph' || block.type === 'bullet' || block.type === 'checklist'
}

export function toParagraph(block: NoteBlock): NoteBlock {
  if (!isTextBlock(block)) return block
  return { id: block.id, type: 'paragraph', spans: block.spans }
}

export function toBullet(block: NoteBlock): NoteBlock {
  if (!isTextBlock(block)) return block
  return { id: block.id, type: 'bullet', spans: block.spans }
}

export function toChecklist(block: NoteBlock, checked = false): NoteBlock {
  if (!isTextBlock(block)) return block
  const alreadyChecked = block.type === 'checklist' ? block.checked : checked
  return { id: block.id, type: 'checklist', checked: alreadyChecked, spans: block.spans }
}

export function isMediaBlock(
  block: NoteBlock,
): block is Extract<NoteBlock, { type: 'image' | 'attachment' }> {
  return block.type === 'image' || block.type === 'attachment'
}

export function countMediaBlocks(blocks: NoteBlock[]): number {
  return blocks.filter(isMediaBlock).length
}

export function collectMediaPaths(blocks: NoteBlock[]): string[] {
  return blocks.filter(isMediaBlock).map((block) => block.media.relativePath)
}

export function ensureBlocks(blocks: NoteBlock[] | undefined): NoteBlock[] {
  if (!blocks || blocks.length === 0) return [emptyParagraph()]
  return blocks
}

export function isEmptyDraft(note: Pick<NoteDocument, 'title' | 'blocks' | 'pinned' | 'kind' | 'dueDate'>): boolean {
  if (note.pinned) return false
  if (note.title.trim()) return false
  if (note.kind === 'task' && note.dueDate) return false
  if (note.blocks.some(isMediaBlock)) return false
  return note.blocks.every((block) => {
    if (!isTextBlock(block)) return false
    return blockToPlainText(block).trim() === ''
  })
}
