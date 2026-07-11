import { STORAGE_KEYS } from '../constants/auth'

type AvatarStore = Record<string, string>

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readStore(): AvatarStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AVATARS)
    return raw ? (JSON.parse(raw) as AvatarStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: AvatarStore): void {
  localStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(store))
}

export function getAvatarDataUrl(email: string): string | null {
  const avatar = readStore()[normalizeEmail(email)]
  return typeof avatar === 'string' && avatar.startsWith('data:image/') ? avatar : null
}

export function setAvatarDataUrl(email: string, dataUrl: string): void {
  const store = readStore()
  store[normalizeEmail(email)] = dataUrl
  writeStore(store)
}

export function clearAvatarDataUrl(email: string): void {
  const store = readStore()
  delete store[normalizeEmail(email)]
  writeStore(store)
}
