export const STORAGE_KEYS = {
  AUTH_USER: 'welcome_app_auth',
  NOTES: 'welcome_app_notes',
  SETTINGS: 'welcome_app_settings',
  HABITS: 'welcome_app_habits',
  HABIT_LOGS: 'welcome_app_habit_logs',
} as const

export const APP_INFO = {
  name: 'Welcome App',
  version: '1.2.1',
  privacyPolicyUrl: 'https://husky1711.github.io/welcome-app/',
  contactEmail: 'ponnapuvvulasaiprasad@gmail.com',
} as const

export const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
} as const
