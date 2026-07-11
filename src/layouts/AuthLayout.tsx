import { Outlet } from 'react-router-dom'
import signInBackground from '../assets/sign-in-background.png'
import signInLogo from '../assets/sign-in-logo.png'
import {
  GridIcon,
  LeafIcon,
  NotesIcon,
  SunIcon,
} from '../components/auth/AuthIcons'
import '../styles/sign-in-page.css'

const FEATURE_CHIPS = [
  { id: 'habits', label: 'Habits', icon: LeafIcon },
  { id: 'notes', label: 'Notes', icon: NotesIcon },
  { id: 'today', label: 'Today', icon: SunIcon },
  { id: 'more', label: 'More', icon: GridIcon },
] as const

export function AuthLayout() {
  return (
    <div className="login-route">
      <div className="sign-in-page">
        <div className="sign-in-page__bg" aria-hidden="true">
          <img src={signInBackground} alt="" />
        </div>

        <header className="hero">
          <div className="hero__paper">
            <img className="hero__logo" src={signInLogo} alt="Welcome App logo" />
            <h1 className="hero__title">Welcome App</h1>
            <p className="hero__tagline">Your day. Your work. Your space.</p>

            <div className="hero__chips">
              {FEATURE_CHIPS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className="chip" tabIndex={-1} aria-hidden="true">
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hero__spacer" aria-hidden="true" />
        </header>

        <div className="sign-in-card-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
