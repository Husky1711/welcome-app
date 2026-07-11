import { processImageFile } from './imageUpload'

export const HABIT_ICON_OUTPUT_SIZE = 128

export function isHabitIconImage(icon: string): boolean {
  return icon.startsWith('data:image/')
}

export async function processHabitIconFile(file: File): Promise<string> {
  return processImageFile(file, HABIT_ICON_OUTPUT_SIZE)
}

export function getHabitReminderIconPrefix(icon: string): string {
  return isHabitIconImage(icon) ? '🔔' : icon
}
