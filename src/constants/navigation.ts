import { ROUTES } from './routes'

export type NavIconKey = 'home' | 'today' | 'insights' | 'habits'

export const BOTTOM_NAV_TABS: ReadonlyArray<{
  to: string
  label: string
  icon: NavIconKey
}> = [
  { to: ROUTES.WELCOME, label: 'Home', icon: 'home' },
  { to: ROUTES.TODAY, label: 'Today', icon: 'today' },
  { to: ROUTES.CALENDAR, label: 'Insights', icon: 'insights' },
  { to: ROUTES.HABITS, label: 'Habits', icon: 'habits' },
]

export const BOTTOM_NAV_ROUTES: readonly string[] = BOTTOM_NAV_TABS.map((tab) => tab.to)

/** Secondary screens reached from Home — still show the tab bar for consistent navigation. */
export const SECONDARY_APP_ROUTES: readonly string[] = [
  ROUTES.NOTES,
  ROUTES.COACH,
  ROUTES.COMPANION,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
]

export const BOTTOM_NAV_VISIBLE_ROUTES: readonly string[] = [
  ...BOTTOM_NAV_ROUTES,
  ...SECONDARY_APP_ROUTES,
]
