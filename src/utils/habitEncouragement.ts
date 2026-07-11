import type { Habit } from '../types/habit'

const HABIT_SUBTITLES: Array<{ pattern: RegExp; text: string }> = [
  { pattern: /water|drink|hydrat/i, text: 'Keep your body + mind flowing.' },
  { pattern: /meditat/i, text: 'Center your mind. Breathe.' },
  { pattern: /workout|exercise|walk|run|move|gym/i, text: 'Movement is medicine.' },
  { pattern: /read|book|page/i, text: 'Feed your mind. Grow daily.' },
  { pattern: /journal|write|note/i, text: 'Capture what matters today.' },
  { pattern: /sleep|rest/i, text: 'Rest well. Rise refreshed.' },
]

export function getHabitEncouragement(habit: Habit, completed: boolean): string {
  if (completed) {
    return 'Done for today — well done.'
  }

  for (const entry of HABIT_SUBTITLES) {
    if (entry.pattern.test(habit.title)) {
      return entry.text
    }
  }

  return 'One small step at a time.'
}
