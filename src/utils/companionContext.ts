import type { CompanionContext } from './companion'
import { formatLocalDate } from './dateUtils'
import { getCurrentStreak } from './habitStats'
import { getActiveHabits, isHabitCompletedOnDate } from './habitStorage'

/** Read fresh at each appearance so the companion reacts to the current day. */
export function readCompanionContext(now: Date = new Date()): CompanionContext {
  const date = formatLocalDate(now)

  try {
    const habits = getActiveHabits()
    let habitsCompleted = 0
    let bestStreak = 0

    for (const habit of habits) {
      if (isHabitCompletedOnDate(habit.id, date)) habitsCompleted += 1
      bestStreak = Math.max(bestStreak, getCurrentStreak(habit.id, date))
    }

    return {
      hour: now.getHours(),
      habitsTotal: habits.length,
      habitsCompleted,
      bestStreak,
    }
  } catch {
    return { hour: now.getHours(), habitsTotal: 0, habitsCompleted: 0, bestStreak: 0 }
  }
}
