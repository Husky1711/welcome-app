import { beforeEach, describe, expect, it } from 'vitest'
import {
  blockHasMark,
  documentPreview,
  emptyChecklist,
  emptyParagraph,
  noteCardText,
  setBlockText,
  toBullet,
  toChecklist,
  toParagraph,
  toggleBlockMark,
} from './noteBlocks'

describe('noteBlocks', () => {
  beforeEach(() => {
    // no shared state
  })

  it('toggles bold marks on a block', () => {
    let block = setBlockText(emptyParagraph(), 'Hello')
    block = toggleBlockMark(block, 'bold')
    expect(blockHasMark(block, 'bold')).toBe(true)
    block = toggleBlockMark(block, 'bold')
    expect(blockHasMark(block, 'bold')).toBe(false)
  })

  it('builds previews from checklist and paragraph text', () => {
    const preview = documentPreview({
      blocks: [
        setBlockText(emptyChecklist(true), 'Done item'),
        setBlockText(emptyParagraph(), 'More detail here'),
      ],
    })
    expect(preview).toContain('Done item')
    expect(preview).toContain('More detail')
  })

  it('uses the first body line as the card title when the title is empty', () => {
    const text = noteCardText({
      title: '',
      blocks: [
        setBlockText(emptyParagraph(), 'Grocery ideas'),
        setBlockText(emptyParagraph(), 'Milk and apples'),
      ],
    })

    expect(text).toEqual({
      title: 'Grocery ideas',
      preview: 'Milk and apples',
      isUntitled: false,
    })
  })

  it('does not repeat a one-line body under its derived title', () => {
    const text = noteCardText({
      title: '  ',
      blocks: [setBlockText(emptyParagraph(), 'A quick thought')],
    })

    expect(text.title).toBe('A quick thought')
    expect(text.preview).toBe('')
  })

  it('keeps Untitled only for a completely empty note', () => {
    expect(noteCardText({ title: '', blocks: [emptyParagraph()] })).toEqual({
      title: 'Untitled',
      preview: '',
      isUntitled: true,
    })
  })

  it('keeps the body preview when a real title exists', () => {
    const text = noteCardText({
      title: 'Shopping',
      blocks: [setBlockText(emptyParagraph(), 'Milk and apples')],
    })

    expect(text.title).toBe('Shopping')
    expect(text.preview).toBe('Milk and apples')
  })

  it('converts block types while keeping text', () => {
    const paragraph = setBlockText(emptyParagraph(), 'Milk')
    const bullet = toBullet(paragraph)
    expect(bullet.type).toBe('bullet')
    expect(blockHasMark(bullet, 'bold')).toBe(false)
    expect(toParagraph(bullet).type).toBe('paragraph')
    expect(toChecklist(bullet).type).toBe('checklist')
  })
})
