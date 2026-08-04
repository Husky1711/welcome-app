/**
 * Pure geometry for the roaming companion. The component measures the live DOM
 * and hands plain rectangles to these helpers, which decide where the sprite
 * may safely appear. Keeping this logic pure makes the "never block the user"
 * guarantee testable.
 */

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface Viewport {
  width: number
  height: number
}

/** The vertical band the companion is allowed to roam within (px from top). */
export interface Band {
  top: number
  bottom: number
}

export type SpotKind = 'edge-left' | 'edge-right' | 'perch' | 'cross'

export interface CompanionSpot {
  /** Horizontal centre of the sprite, in px. */
  x: number
  /** Vertical baseline (sprite feet), in px. */
  y: number
  kind: SpotKind
  /** Which side the sprite enters from. */
  from: 'left' | 'right'
}

function right(rect: Rect): number {
  return rect.left + rect.width
}

function bottom(rect: Rect): number {
  return rect.top + rect.height
}

/** Axis-aligned overlap test with an optional padding margin. */
export function rectsOverlap(a: Rect, b: Rect, margin = 0): boolean {
  return (
    a.left - margin < right(b) &&
    right(a) + margin > b.left &&
    a.top - margin < bottom(b) &&
    bottom(a) + margin > b.top
  )
}

/**
 * True when a sprite of `size` centred on (x, y-as-feet) would collide with any
 * no-go rectangle (buttons, inputs, open sheets…).
 */
export function spotIsClear(
  spot: Pick<CompanionSpot, 'x' | 'y'>,
  size: number,
  noGo: readonly Rect[],
  margin = 6,
): boolean {
  const half = size / 2
  const spriteRect: Rect = {
    left: spot.x - half,
    top: spot.y - size,
    width: size,
    height: size,
  }
  return !noGo.some((rect) => rectsOverlap(spriteRect, rect, margin))
}

/** Edge and cross spots derived only from the viewport and roam band. */
export function buildEdgeSpots(viewport: Viewport, band: Band, size: number): CompanionSpot[] {
  const usableTop = band.top + size
  const usableBottom = band.bottom
  const midY = Math.round((usableTop + usableBottom) / 2)
  const inset = Math.round(size * 0.55)

  return [
    { x: inset, y: midY, kind: 'edge-left', from: 'left' },
    { x: viewport.width - inset, y: midY, kind: 'edge-right', from: 'right' },
    { x: Math.round(viewport.width * 0.5), y: usableBottom, kind: 'cross', from: 'left' },
  ]
}

/**
 * Perch spots sit the companion on the top edge of safe anchor rects (cards,
 * the streak ring, the nav pill). Anchors are ignored when too small or partly
 * off the roam band.
 */
export function buildPerchSpots(
  anchors: readonly Rect[],
  band: Band,
  size: number,
  minWidth = size * 1.5,
): CompanionSpot[] {
  const spots: CompanionSpot[] = []
  for (const anchor of anchors) {
    if (anchor.width < minWidth) continue
    const y = anchor.top
    if (y - size < band.top || y > band.bottom) continue
    const x = Math.round(anchor.left + anchor.width * (0.25 + Math.random() * 0.5))
    spots.push({ x, y, kind: 'perch', from: x < anchor.left + anchor.width / 2 ? 'left' : 'right' })
  }
  return spots
}

/**
 * Chooses a clear spot. Perch spots are preferred (they feel intentional) with
 * edges as the always-available fallback. Returns null only if everything is
 * blocked, in which case the caller should skip this appearance.
 */
export function chooseSpot(
  perchSpots: readonly CompanionSpot[],
  edgeSpots: readonly CompanionSpot[],
  size: number,
  noGo: readonly Rect[],
  random: () => number = Math.random,
): CompanionSpot | null {
  const clearPerch = perchSpots.filter((spot) => spotIsClear(spot, size, noGo))
  const clearEdge = edgeSpots.filter((spot) => spotIsClear(spot, size, noGo))

  // Favour perches ~75% of the time when both are available (easier to spot).
  const preferPerch = clearPerch.length > 0 && (clearEdge.length === 0 || random() < 0.75)
  const pool = preferPerch ? clearPerch : clearEdge.length > 0 ? clearEdge : clearPerch
  if (pool.length === 0) return null

  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  return pool[index]
}
