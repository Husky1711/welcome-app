import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useSettings } from '../../contexts/SettingsContext'
import { useAuth } from '../../hooks/useAuth'
import { useProfileAvatar } from '../../hooks/useProfileAvatar'
import {
  SettingsChevronIcon,
  SettingsLogOutIcon,
  SettingsSunIcon,
} from '../settings/SettingsIcons'
import { ProfileFeatureIcon, SettingsFeatureIcon } from '../icons/NavIcons'

interface AccountSheetProps {
  open: boolean
  onClose: () => void
}

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M19 13.5A7.5 7.5 0 1 1 10.5 5 6 6 0 0 0 19 13.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccountSheet({ open, onClose }: AccountSheetProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { settings, setTheme } = useSettings()
  const { avatarUrl } = useProfileAvatar(user?.email)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isDark = settings.theme === 'dark'

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !user) {
    return null
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      onClose()
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="account-sheet" role="dialog" aria-modal="true" aria-label="Your account">
      <button
        type="button"
        className="account-sheet__backdrop"
        aria-label="Dismiss"
        onClick={onClose}
      />

      <div className="account-sheet__panel">
        <div className="account-sheet__handle" aria-hidden="true" />

        <div className="account-sheet__identity">
          <span className="account-sheet__avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="account-sheet__avatar-image" />
            ) : (
              <span className="account-sheet__avatar-initials">{initials || '?'}</span>
            )}
          </span>
          <div className="account-sheet__identity-copy">
            <p className="account-sheet__name">{user.displayName}</p>
            <p className="account-sheet__email">{user.email}</p>
          </div>

          <div className="account-sheet__theme" role="group" aria-label="Appearance">
            <button
              type="button"
              className={`account-sheet__theme-btn ${
                !isDark ? 'account-sheet__theme-btn--active' : ''
              }`}
              aria-pressed={!isDark}
              onClick={() => setTheme('light')}
            >
              <SettingsSunIcon />
              <span className="sr-only">Light mode</span>
            </button>
            <button
              type="button"
              className={`account-sheet__theme-btn ${
                isDark ? 'account-sheet__theme-btn--active' : ''
              }`}
              aria-pressed={isDark}
              onClick={() => setTheme('dark')}
            >
              <MoonIcon />
              <span className="sr-only">Dark mode</span>
            </button>
          </div>
        </div>

        <div className="account-sheet__list">
          <Link
            to={ROUTES.PROFILE}
            className="account-sheet__row"
            onClick={onClose}
          >
            <span className="account-sheet__row-icon" aria-hidden="true">
              <ProfileFeatureIcon />
            </span>
            <span className="account-sheet__row-label">Profile</span>
            <SettingsChevronIcon className="account-sheet__chevron" />
          </Link>

          <Link
            to={ROUTES.SETTINGS}
            className="account-sheet__row"
            onClick={onClose}
          >
            <span className="account-sheet__row-icon" aria-hidden="true">
              <SettingsFeatureIcon />
            </span>
            <span className="account-sheet__row-label">Settings</span>
            <SettingsChevronIcon className="account-sheet__chevron" />
          </Link>

          <button
            type="button"
            className="account-sheet__row account-sheet__row--danger"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            aria-label="Log out of your account"
          >
            <span className="account-sheet__row-icon" aria-hidden="true">
              <SettingsLogOutIcon />
            </span>
            <span className="account-sheet__row-label">
              {isLoggingOut ? 'Signing out…' : 'Log out'}
            </span>
            <SettingsChevronIcon className="account-sheet__chevron" />
          </button>
        </div>
      </div>
    </div>
  )
}
