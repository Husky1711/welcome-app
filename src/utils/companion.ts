export type CompanionActivity =
  | 'idle'
  | 'wave'
  | 'peek'
  | 'stretch'
  | 'celebrate'
  | 'nap'
  | 'point'

export interface CompanionContext {
  hour: number
  habitsTotal: number
  habitsCompleted: number
  bestStreak: number
}

export interface CompanionMoment {
  activity: CompanionActivity
  message: string | null
}

/**
 * Tunable rhythm. Appearances stay rare on purpose — the companion is charming
 * because it is scarce, and a busy mascot reads as noise.
 */
export const COMPANION_TIMING = {
  /** Short first visit so people notice the companion exists. */
  firstDelayMs: 1_000,
  /** After the first peek: one appearance every ~45–90s (still scarce). */
  minGapMs: 45_000,
  maxGapMs: 90_000,
  /** How long the companion lingers before it leaves. */
  activityMs: 7_000,
} as const

const CASUAL_MOMENTS: readonly CompanionMoment[] = [
  { activity: 'wave', message: null },
  { activity: 'peek', message: null },
  { activity: 'idle', message: null },
  { activity: 'wave', message: 'Hey there.' },
  { activity: 'peek', message: null },
  { activity: 'idle', message: 'Just passing by.' },
]

function pick<T>(items: readonly T[], random: () => number): T {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length))
  return items[index]
}

/**
 * Chooses what the companion does when it stops, based on real app state so the
 * animation carries information instead of only decoration.
 */
export function pickMoment(
  context: CompanionContext,
  random: () => number = Math.random,
): CompanionMoment {
  const { hour, habitsTotal, habitsCompleted, bestStreak } = context
  const allDone = habitsTotal > 0 && habitsCompleted >= habitsTotal

  if (allDone) {
    return {
      activity: 'celebrate',
      message: bestStreak >= 2 ? `${bestStreak} day streak!` : 'All done today!',
    }
  }

  if (hour >= 21 || hour < 5) {
    return { activity: 'nap', message: random() < 0.5 ? 'Winding down?' : null }
  }

  if (hour < 10) {
    return { activity: 'stretch', message: random() < 0.6 ? 'Morning!' : null }
  }

  if (habitsTotal > 0 && habitsCompleted === 0 && hour >= 13) {
    return { activity: 'point', message: 'Nothing ticked yet.' }
  }

  if (habitsTotal > 0 && habitsCompleted < habitsTotal && random() < 0.35) {
    const left = habitsTotal - habitsCompleted
    return { activity: 'point', message: `${left} left today.` }
  }

  return pick(CASUAL_MOMENTS, random)
}

/** Milliseconds to wait before the next appearance. */
export function nextAppearanceDelay(random: () => number = Math.random): number {
  const { minGapMs, maxGapMs } = COMPANION_TIMING
  return Math.round(minGapMs + random() * (maxGapMs - minGapMs))
}
