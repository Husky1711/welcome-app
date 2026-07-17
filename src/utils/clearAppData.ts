import { cancelAllHabitReminders } from '../services/habitReminderService'
import { DEFAULT_APP_COLOR } from '../constants/appColors'
import { clearStoredAvatars } from './avatarStorage'
import { clearStoredHabits } from './habitStorage'
import { clearStoredNotes } from './noteStorage'
import { applySettingsToDocument, clearStoredSettings } from './settingsStorage'
import { clearStoredUser } from './storage'

export function clearAllAppData(): void {
  clearStoredUser()
  clearStoredAvatars()
  clearStoredNotes()
  clearStoredHabits()
  void cancelAllHabitReminders()
  clearStoredSettings()
  applySettingsToDocument({ theme: 'light', appColor: DEFAULT_APP_COLOR })
}
