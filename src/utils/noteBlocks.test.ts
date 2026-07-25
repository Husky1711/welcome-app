import { beforeEach, describe, expect, it } from 'vitest'
import {
  blockHasMark,
  documentPreview,
  emptyChecklist,
  emptyParagraph,
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

  it('converts block types while keeping text', () => {
    const paragraph = setBlockText(emptyParagraph(), 'Milk')
    const bullet = toBullet(paragraph)
    expect(bullet.type).toBe('bullet')
    expect(blockHasMark(bullet, 'bold')).toBe(false)
    expect(toParagraph(bullet).type).toBe('paragraph')
    expect(toChecklist(bullet).type).toBe('checklist')
  })
})
