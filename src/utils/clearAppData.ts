import { cancelAllHabitReminders } from '../services/habitReminderService'
import { clearStoredHabits } from './habitStorage'
import { clearStoredNotes } from './noteStorage'
import { clearStoredSettings, applyThemeToDocument } from './settingsStorage'
import { clearStoredUser } from './storage'

export function clearAllAppData(): void {
  clearStoredUser()
  clearStoredNotes()
  clearStoredHabits()
  void cancelAllHabitReminders()
  clearStoredSettings()
  applyThemeToDocument('light')
}
