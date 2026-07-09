import { clearStoredNotes } from './noteStorage'
import { clearStoredSettings, applyThemeToDocument } from './settingsStorage'
import { clearStoredUser } from './storage'

export function clearAllAppData(): void {
  clearStoredUser()
  clearStoredNotes()
  clearStoredSettings()
  applyThemeToDocument('light')
}
