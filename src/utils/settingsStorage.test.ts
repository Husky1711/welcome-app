import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../constants/auth'
import {
  applySettingsToDocument,
  getStoredSettings,
  setStoredAppColor,
  setStoredTheme,
} from './settingsStorage'

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    delete document.documentElement.dataset.appColor
  })

  it('uses Forest and light mode by default', () => {
    expect(getStoredSettings()).toEqual({
      theme: 'light',
      appColor: 'forest',
    })
  })

  it('migrates settings saved before app colors existed', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' }))

    expect(getStoredSettings()).toEqual({
      theme: 'dark',
      appColor: 'forest',
    })
  })

  it('preserves app color when theme changes and vice versa', () => {
    setStoredAppColor('plum')
    expect(setStoredTheme('dark')).toEqual({
      theme: 'dark',
      appColor: 'plum',
    })

    expect(setStoredAppColor('ocean')).toEqual({
      theme: 'dark',
      appColor: 'ocean',
    })
  })

  it('applies theme and app color to the document', () => {
    applySettingsToDocument({ theme: 'dark', appColor: 'terracotta' })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.appColor).toBe('terracotta')
  })
})
