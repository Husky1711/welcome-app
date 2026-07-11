export function getProgressMessage(
  habitCount: number,
  percent: number,
  completed: number,
): string {
  if (habitCount === 0) {
    return 'Start with one small habit today.'
  }
  if (percent === 100) {
    return 'Beautiful work — every habit is complete.'
  }
  if (completed === 0) {
    return 'A calm day begins with one small step.'
  }
  return "You're making great progress today."
}

export function getTodayStatusLabel(
  habitCount: number,
  completed: number,
  total: number,
  percent: number,
): string {
  if (habitCount === 0) {
    return 'No habits yet'
  }
  if (percent === 100) {
    return 'All habits done today'
  }
  if (completed === 0) {
    return `${habitCount} habit${habitCount === 1 ? '' : 's'} waiting`
  }
  return `${completed} of ${total} habits done`
}

export function getTodayHeroHeadline(
  habitCount: number,
  percent: number,
  completed: number,
): string {
  if (habitCount === 0) {
    return 'Start with one small habit'
  }
  if (percent === 100) {
    return "You're on track"
  }
  if (completed === 0) {
    return 'A calm day begins'
  }
  return "You're on track"
}

export function getTodayHeroSubtitle(): string {
  return 'Small steps today, big change tomorrow.'
}
