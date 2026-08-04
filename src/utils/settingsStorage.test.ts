import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../constants/auth'
import {
  applySettingsToDocument,
  getStoredSettings,
  setStoredAppColor,
  setStoredCompanionEnabled,
  setStoredTheme,
} from './settingsStorage'

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    delete document.documentElement.dataset.appColor
  })

  it('uses Forest, light mode, and no companion by default', () => {
    expect(getStoredSettings()).toEqual({
      theme: 'light',
      appColor: 'forest',
      companionEnabled: false,
    })
  })

  it('migrates settings saved before app colors existed', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' }))

    expect(getStoredSettings()).toEqual({
      theme: 'dark',
      appColor: 'forest',
      companionEnabled: false,
    })
  })

  it('preserves app color when theme changes and vice versa', () => {
    setStoredAppColor('plum')
    expect(setStoredTheme('dark')).toEqual({
      theme: 'dark',
      appColor: 'plum',
      companionEnabled: false,
    })

    expect(setStoredAppColor('ocean')).toEqual({
      theme: 'dark',
      appColor: 'ocean',
      companionEnabled: false,
    })
  })

  it('keeps the companion preference across other setting changes', () => {
    expect(setStoredCompanionEnabled(true).companionEnabled).toBe(true)
    expect(setStoredTheme('dark').companionEnabled).toBe(true)
    expect(getStoredSettings().companionEnabled).toBe(true)
  })

  it('applies theme and app color to the document', () => {
    applySettingsToDocument({ theme: 'dark', appColor: 'terracotta', companionEnabled: true })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.appColor).toBe('terracotta')
  })
})
