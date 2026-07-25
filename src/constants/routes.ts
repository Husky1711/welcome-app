export const ROUTES = {
  LOGIN: '/',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  WELCOME: '/welcome',
  TODAY: '/today',
  CALENDAR: '/calendar',
  HABITS: '/habits',
  NOTES: '/notes',
  NOTE_EDITOR: '/notes/:noteId',
  COACH: '/coach',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

export function noteEditorPath(noteId: string): string {
  return `/notes/${noteId}`
}
