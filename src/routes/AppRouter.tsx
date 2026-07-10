import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { CalendarPage } from '../pages/CalendarPage'
import { HabitsPage } from '../pages/HabitsPage'
import { LoginPage } from '../pages/LoginPage'
import { NotesPage } from '../pages/NotesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { TodayPage } from '../pages/TodayPage'
import { WelcomePage } from '../pages/WelcomePage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={ROUTES.TODAY} element={<TodayPage />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path={ROUTES.HABITS} element={<HabitsPage />} />
        <Route path={ROUTES.NOTES} element={<NotesPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
