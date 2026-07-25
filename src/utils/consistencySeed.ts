import {
  addDaysToDate,
  eachDateInRange,
  formatLocalDate,
  getCycleWindow,
  parseLocalDate,
} from './dateUtils'
import {
  getActiveHabits,
  isHabitCompletedOnDate,
  setHabitCompleted,
} from './habitStorage'

const CONSISTENCY_SEED_FLAG = 'welcome_app_consistency_seed_v3'

/**
 * Demo/test helper: backfills a varied completion pattern across the last 5
 * weeks so Insights heatmaps look designed. Never call this from production UI —
 * fabricated history must not enter Coach/AI context.
 *
 * Kept for unit tests and explicit demo fixtures only.
 */
export function ensureConsistencyHistorySeed(
  today: string = formatLocalDate(),
): boolean {
  if (typeof localStorage === 'undefined') return false
  if (localStorage.getItem(CONSISTENCY_SEED_FLAG) === '1') return false

  const habits = getActiveHabits()
  if (habits.length === 0) return false

  const { start: thisWeekStart } = getCycleWindow(today, 'weekly')
  const mapStart = addDaysToDate(thisWeekStart, -28)
  const pastDates = eachDateInRange(mapStart, today).filter((date) => date <= today)
  const historyDates = pastDates.filter((date) => date < today)

  const pastActiveDays = historyDates.filter((date) =>
    habits.some((habit) => isHabitCompletedOnDate(habit.id, date)),
  ).length

  // Enough real history — leave the map alone.
  if (pastActiveDays >= 10) {
    localStorage.setItem(CONSISTENCY_SEED_FLAG, '1')
    return false
  }

  habits.forEach((habit, habitIndex) => {
    for (const date of pastDates) {
      if (isHabitCompletedOnDate(habit.id, date)) continue

      const weekday = parseLocalDate(date).getDay() // 0 Sun … 6 Sat
      const dayNum = parseLocalDate(date).getDate()
      // Design-like pattern: denser mid-week, lighter weekends, intentional gaps.
      const weekdayWeight =
        weekday === 0 ? 0.4 : weekday === 6 ? 0.5 : weekday === 1 ? 0.75 : 0.9
      const gap = (dayNum + habitIndex * 3) % 6 === 0
      const shouldComplete =
        !gap && (dayNum * 17 + habitIndex * 11 + weekday * 5) % 100 < weekdayWeight * 100

      if (shouldComplete) {
        setHabitCompleted(habit.id, date, true)
      }
    }
  })

  localStorage.setItem(CONSISTENCY_SEED_FLAG, '1')
  return true
}
