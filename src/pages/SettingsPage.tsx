import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import {
  SettingsChevronIcon,
  SettingsDeviceIcon,
  SettingsInfoIcon,
  SettingsLogOutIcon,
  SettingsMailIcon,
  SettingsShieldIcon,
  SettingsSunIcon,
  SettingsTrashIcon,
} from '../components/settings/SettingsIcons'
import { APP_INFO } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../hooks/useAuth'
import { clearAllAppData } from '../utils/clearAppData'
import { AppLayout } from '../layouts/AppLayout'
import signInLogo from '../assets/sign-in-logo.png'
import '../styles/settings-page.css'

export function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { settings, toggleTheme } = useSettings()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isDark = settings.theme === 'dark'

  async function handleClearData() {
    setIsClearing(true)
    try {
      clearAllAppData()
      await logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsClearing(false)
      setShowClearConfirm(false)
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AppLayout
      title="Settings"
      subtitle="Theme, privacy, and app data."
      showBrand
      align="top"
    >
      <div className="settings-page">
        <section className="settings-hero" aria-label="About Welcome App">
          <div className="settings-hero__glow" aria-hidden="true" />
          <div className="settings-hero__content">
            <div className="settings-hero__logo-wrap" aria-hidden="true">
              <img src={signInLogo} alt="" className="settings-hero__logo" />
            </div>
            <div className="settings-hero__copy">
              <h2 className="settings-hero__title">{APP_INFO.name}</h2>
              <p className="settings-hero__tagline">Your day. Your work. Your space.</p>
              <span className="settings-hero__version">v{APP_INFO.version}</span>
            </div>
          </div>
        </section>

        <section className="settings-panel" aria-label="App settings">
          <div className="settings-panel__row">
            <div className="settings-panel__row-main">
              <SettingsSunIcon className="settings-panel__icon" />
              <div className="settings-panel__copy">
                <span className="settings-panel__label">Appearance</span>
                <span className="settings-panel__value">{isDark ? 'Dark mode' : 'Light mode'}</span>
              </div>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                role="switch"
                className="settings-toggle__input"
                checked={isDark}
                onChange={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              />
              <span className="settings-toggle__track" aria-hidden="true">
                <span className="settings-toggle__thumb" />
              </span>
            </label>
          </div>

          <div className="settings-panel__row">
            <div className="settings-panel__row-main">
              <SettingsInfoIcon className="settings-panel__icon" />
              <span className="settings-panel__label settings-panel__label--inline">Version</span>
            </div>
            <span className="settings-panel__aside">{APP_INFO.version}</span>
          </div>

          <div className="settings-panel__row">
            <div className="settings-panel__row-main">
              <SettingsMailIcon className="settings-panel__icon" />
              <span className="settings-panel__label settings-panel__label--inline">Contact</span>
            </div>
            <a
              href={`mailto:${APP_INFO.contactEmail}`}
              className="settings-panel__aside settings-panel__aside--link"
            >
              {APP_INFO.contactEmail}
            </a>
          </div>

          <div className="settings-panel__row">
            <a
              href={APP_INFO.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-panel__link-row"
            >
              <div className="settings-panel__row-main">
                <SettingsShieldIcon className="settings-panel__icon" />
                <span className="settings-panel__label settings-panel__label--inline">Privacy policy</span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron" />
            </a>
          </div>

          <hr className="settings-panel__divider" />

          <div className="settings-panel__row settings-panel__row--action">
            <button
              type="button"
              className="settings-panel__link-row settings-panel__link-row--warning"
              onClick={() => setShowClearConfirm(true)}
            >
              <div className="settings-panel__row-main">
                <SettingsTrashIcon className="settings-panel__icon settings-panel__icon--warning" />
                <span className="settings-panel__label settings-panel__label--inline settings-panel__label--warning">
                  Clear all app data
                </span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron settings-panel__chevron--warning" />
            </button>
          </div>

          <div className="settings-panel__row settings-panel__row--action">
            <button
              type="button"
              className="settings-panel__link-row settings-panel__link-row--danger"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Log out of your account"
            >
              <div className="settings-panel__row-main">
                <SettingsLogOutIcon className="settings-panel__icon settings-panel__icon--danger" />
                <span className="settings-panel__label settings-panel__label--inline settings-panel__label--danger">
                  {isLoggingOut ? 'Signing out…' : 'Log out'}
                </span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron settings-panel__chevron--danger" />
            </button>
          </div>

          <p className="settings-panel__footer">
            <SettingsDeviceIcon className="settings-panel__footer-icon" />
            Notes, habits &amp; settings stay on this device
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all app data?"
        message="This will delete your habits, notes, profile session, and settings from this device. You will be signed out."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear data'}
        destructive
        confirmDisabled={isClearing}
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </AppLayout>
  )
}
