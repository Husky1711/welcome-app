import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { AuthLayout } from '../layouts/AuthLayout'
import { CalendarPage } from '../pages/CalendarPage'
import { CoachPage } from '../pages/CoachPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HabitsPage } from '../pages/HabitsPage'
import { NoteEditorPage } from '../pages/NoteEditorPage'
import { NotesPage } from '../pages/NotesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { TodayPage } from '../pages/TodayPage'
import { WelcomePage } from '../pages/WelcomePage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<SignInPage />} />
          <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path="/sign-up/verify" element={<Navigate to={ROUTES.SIGN_UP} replace />} />
          <Route path="/sign-up/account" element={<Navigate to={ROUTES.SIGN_UP} replace />} />
          <Route
            path="/forgot-password/verify"
            element={<Navigate to={ROUTES.FORGOT_PASSWORD} replace />}
          />
          <Route
            path="/forgot-password/reset"
            element={<Navigate to={ROUTES.FORGOT_PASSWORD} replace />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={ROUTES.TODAY} element={<TodayPage />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path={ROUTES.HABITS} element={<HabitsPage />} />
        <Route path={ROUTES.NOTES} element={<NotesPage />} />
        <Route path={ROUTES.NOTE_EDITOR} element={<NoteEditorPage />} />
        <Route path={ROUTES.COACH} element={<CoachPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}
