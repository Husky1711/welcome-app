import { Navigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

/** Legacy route — Companion / Leafu lives at `/companion`. */
export function CoachPage() {
  return <Navigate to={ROUTES.COMPANION} replace />
}
