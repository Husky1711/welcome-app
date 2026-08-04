import { beforeEach, describe, expect, it } from 'vitest'
import {
  addSharedMoment,
  clearSharedMoments,
  listSharedMomentTexts,
  maybeLearnFromUserMessage,
  maybeRecordHabitMoment,
  onLeafuSessionStart,
} from './sharedMoments'

describe('sharedMoments', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('records first chat and prefers gentle tone from messages', () => {
    const first = onLeafuSessionStart()
    expect(first.welcomeBack).toBe(false)
    expect(listSharedMomentTexts().some((text) => /First chat/i.test(text))).toBe(true)

    maybeLearnFromUserMessage("I'm tired and need a gentle pace")
    expect(listSharedMomentTexts().some((text) => /gentle/i.test(text))).toBe(true)
  })

  it('records completed habit while chatting', () => {
    const moment = maybeRecordHabitMoment({
      incompleteBefore: ['Walk', 'Water'],
      incompleteAfter: ['Water'],
      habitCount: 2,
    })
    expect(moment?.text).toMatch(/Walk/)
  })

  it('dedupes identical moments', () => {
    expect(addSharedMoment('Hello moment')).not.toBeNull()
    expect(addSharedMoment('Hello moment')).toBeNull()
    clearSharedMoments()
    expect(listSharedMomentTexts()).toEqual([])
  })
})
