import { ROUTES } from './routes'

export const BOTTOM_NAV_TABS = [
  { to: ROUTES.WELCOME, label: 'Home', icon: '🏠' },
  { to: ROUTES.TODAY, label: 'Today', icon: '☀️' },
  { to: ROUTES.CALENDAR, label: 'Calendar', icon: '📅' },
  { to: ROUTES.HABITS, label: 'Habits', icon: '✅' },
] as const

export const BOTTOM_NAV_ROUTES: readonly string[] = BOTTOM_NAV_TABS.map((tab) => tab.to)
