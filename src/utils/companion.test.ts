import { describe, expect, it } from 'vitest'
import {
  COMPANION_TIMING,
  nextAppearanceDelay,
  pickMoment,
  type CompanionContext,
} from './companion'

function context(overrides: Partial<CompanionContext> = {}): CompanionContext {
  return { hour: 14, habitsTotal: 3, habitsCompleted: 1, bestStreak: 0, ...overrides }
}

/** Deterministic stand-in for Math.random. */
function sequence(...values: number[]): () => number {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

describe('pickMoment', () => {
  it('celebrates with the streak when every habit is done', () => {
    const moment = pickMoment(context({ habitsCompleted: 3, bestStreak: 5 }), sequence(0.5))
    expect(moment.activity).toBe('celebrate')
    expect(moment.message).toBe('5 day streak!')
  })

  it('celebrates without a streak claim on day one', () => {
    const moment = pickMoment(context({ habitsCompleted: 3, bestStreak: 1 }), sequence(0.5))
    expect(moment.activity).toBe('celebrate')
    expect(moment.message).toBe('All done today!')
  })

  it('naps late at night and early morning', () => {
    expect(pickMoment(context({ hour: 22 }), sequence(0.9)).activity).toBe('nap')
    expect(pickMoment(context({ hour: 3 }), sequence(0.9)).activity).toBe('nap')
  })

  it('stretches in the morning', () => {
    expect(pickMoment(context({ hour: 7 }), sequence(0.9)).activity).toBe('stretch')
  })

  it('nudges when nothing is ticked by the afternoon', () => {
    const moment = pickMoment(context({ hour: 15, habitsCompleted: 0 }), sequence(0.9))
    expect(moment.activity).toBe('point')
    expect(moment.message).toBe('Nothing ticked yet.')
  })

  it('reports remaining habits when it decides to nudge', () => {
    const moment = pickMoment(
      context({ hour: 15, habitsTotal: 4, habitsCompleted: 1 }),
      sequence(0.1),
    )
    expect(moment.activity).toBe('point')
    expect(moment.message).toBe('3 left today.')
  })

  it('falls back to a casual moment with no habits set up', () => {
    const moment = pickMoment(context({ habitsTotal: 0, habitsCompleted: 0 }), sequence(0.9, 0))
    expect(['wave', 'peek', 'idle']).toContain(moment.activity)
  })
})

describe('nextAppearanceDelay', () => {
  it('stays inside the configured gap', () => {
    expect(nextAppearanceDelay(sequence(0))).toBe(COMPANION_TIMING.minGapMs)
    expect(nextAppearanceDelay(sequence(1))).toBe(COMPANION_TIMING.maxGapMs)
  })
})
