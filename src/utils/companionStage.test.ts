import { describe, expect, it } from 'vitest'
import {
  buildEdgeSpots,
  buildPerchSpots,
  chooseSpot,
  rectsOverlap,
  spotIsClear,
  type Rect,
} from './companionStage'

const VIEWPORT = { width: 400, height: 800 }
const BAND = { top: 80, bottom: 720 }
const SIZE = 42

function seq(...values: number[]): () => number {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

describe('rectsOverlap', () => {
  it('detects overlap and separation', () => {
    const a: Rect = { left: 0, top: 0, width: 10, height: 10 }
    expect(rectsOverlap(a, { left: 5, top: 5, width: 10, height: 10 })).toBe(true)
    expect(rectsOverlap(a, { left: 20, top: 20, width: 10, height: 10 })).toBe(false)
  })

  it('honours the margin', () => {
    const a: Rect = { left: 0, top: 0, width: 10, height: 10 }
    const b: Rect = { left: 12, top: 0, width: 10, height: 10 }
    expect(rectsOverlap(a, b)).toBe(false)
    expect(rectsOverlap(a, b, 3)).toBe(true)
  })
})

describe('spotIsClear', () => {
  it('is clear when no no-go rects intersect the sprite box', () => {
    expect(spotIsClear({ x: 200, y: 400 }, SIZE, [])).toBe(true)
  })

  it('is blocked when a button sits under the sprite', () => {
    const button: Rect = { left: 180, top: 370, width: 40, height: 40 }
    expect(spotIsClear({ x: 200, y: 400 }, SIZE, [button])).toBe(false)
  })
})

describe('buildEdgeSpots', () => {
  it('always yields left, right, and cross spots inside the viewport', () => {
    const spots = buildEdgeSpots(VIEWPORT, BAND, SIZE)
    expect(spots.map((s) => s.kind)).toEqual(['edge-left', 'edge-right', 'cross'])
    for (const spot of spots) {
      expect(spot.x).toBeGreaterThanOrEqual(0)
      expect(spot.x).toBeLessThanOrEqual(VIEWPORT.width)
    }
  })
})

describe('buildPerchSpots', () => {
  it('creates a perch on a wide card within the band', () => {
    const card: Rect = { left: 40, top: 300, width: 320, height: 120 }
    const spots = buildPerchSpots([card], BAND, SIZE)
    expect(spots).toHaveLength(1)
    expect(spots[0].kind).toBe('perch')
    expect(spots[0].y).toBe(card.top)
  })

  it('skips anchors that are too narrow or outside the band', () => {
    const narrow: Rect = { left: 0, top: 300, width: 30, height: 30 }
    const tooHigh: Rect = { left: 0, top: 10, width: 320, height: 40 }
    expect(buildPerchSpots([narrow, tooHigh], BAND, SIZE)).toHaveLength(0)
  })
})

describe('chooseSpot', () => {
  const card: Rect = { left: 40, top: 300, width: 320, height: 120 }

  it('returns null when every spot is blocked', () => {
    const perch = buildPerchSpots([card], BAND, SIZE)
    const edges = buildEdgeSpots(VIEWPORT, BAND, SIZE)
    const blockEverything: Rect = { left: 0, top: 0, width: 400, height: 800 }
    expect(chooseSpot(perch, edges, SIZE, [blockEverything])).toBeNull()
  })

  it('prefers a perch when random is low', () => {
    const perch = buildPerchSpots([card], BAND, SIZE)
    const edges = buildEdgeSpots(VIEWPORT, BAND, SIZE)
    const chosen = chooseSpot(perch, edges, SIZE, [], seq(0.1, 0))
    expect(chosen?.kind).toBe('perch')
  })

  it('falls back to edges when there are no perches', () => {
    const edges = buildEdgeSpots(VIEWPORT, BAND, SIZE)
    // No perches → the perch-preference roll is skipped; the single random call
    // picks the spot index. 0 → the first edge spot.
    const chosen = chooseSpot([], edges, SIZE, [], seq(0))
    expect(chosen?.kind).toBe('edge-left')
  })
})
