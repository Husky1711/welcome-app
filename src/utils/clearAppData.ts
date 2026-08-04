import { cancelAllHabitReminders } from '../services/habitReminderService'
import { cancelTaskRemindersForStoredNotes } from '../services/taskReminderService'
import { clearSharedMoments } from '../features/leafu/memory/sharedMoments'
import { DEFAULT_APP_COLOR } from '../constants/appColors'
import { clearAllAssistantConsent } from './assistantConsentStorage'
import { clearStoredAvatars } from './avatarStorage'
import { clearStoredHabits } from './habitStorage'
import { clearStoredNotes } from './noteStorage'
import { applySettingsToDocument, clearStoredSettings } from './settingsStorage'
import { clearStoredUser } from './storage'

export function clearLeafuData(): void {
  clearAllAssistantConsent()
  clearSharedMoments()
}

export function clearAllAppData(): void {
  void cancelTaskRemindersForStoredNotes()
  clearStoredUser()
  clearStoredAvatars()
  clearStoredNotes()
  clearStoredHabits()
  clearLeafuData()
  void cancelAllHabitReminders()
  clearStoredSettings()
  applySettingsToDocument({ theme: 'light', appColor: DEFAULT_APP_COLOR, companionEnabled: false })
}
