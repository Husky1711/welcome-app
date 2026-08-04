import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import {
  SettingsChevronIcon,
  SettingsDeviceIcon,
  SettingsFeedbackIcon,
  SettingsInfoIcon,
  SettingsLogOutIcon,
  SettingsShieldIcon,
  SettingsSproutIcon,
  SettingsStarIcon,
  SettingsSunIcon,
  SettingsTrashIcon,
} from '../components/settings/SettingsIcons'
import { APP_COLOR_OPTIONS } from '../constants/appColors'
import { APP_INFO } from '../constants/auth'
import { ROUTES } from '../constants/routes'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../hooks/useAuth'
import { clearAllAppData, clearLeafuData } from '../utils/clearAppData'
import { AppLayout } from '../layouts/AppLayout'
import signInLogo from '../assets/sign-in-logo.png'
import '../styles/settings-page.css'

const FEEDBACK_MAILTO = `mailto:${APP_INFO.contactEmail}?subject=${encodeURIComponent(
  'Welcome App feedback',
)}`

export function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { settings, setAppColor, toggleTheme, toggleCompanion } = useSettings()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearLeafuConfirm, setShowClearLeafuConfirm] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isClearingLeafu, setIsClearingLeafu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isDark = settings.theme === 'dark'
  const selectedAppColor =
    APP_COLOR_OPTIONS.find((option) => option.id === settings.appColor) ??
    APP_COLOR_OPTIONS[0]

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

  function handleClearLeafuData() {
    setIsClearingLeafu(true)
    try {
      clearLeafuData()
    } finally {
      setIsClearingLeafu(false)
      setShowClearLeafuConfirm(false)
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
      subtitle="Theme, feedback, and app data."
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
              <p className="settings-hero__tagline">{APP_INFO.tagline}</p>
              <span className="settings-hero__version">v{APP_INFO.version}</span>
            </div>
          </div>
        </section>

        <section className="settings-panel" aria-label="App settings">
          <div className="settings-panel__row">
            <div className="settings-panel__row-main">
              <SettingsSunIcon className="settings-panel__icon" />
              <div className="settings-panel__copy">
                <span className="settings-panel__label">Theme</span>
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

          <div className="settings-panel__row settings-panel__row--palette">
            <div className="settings-panel__palette-heading">
              <div className="settings-panel__copy">
                <span className="settings-panel__label">App color</span>
                <span className="settings-panel__value">{selectedAppColor.label}</span>
              </div>
            </div>

            <div
              className="app-color-picker"
              role="radiogroup"
              aria-label="App color"
            >
              {APP_COLOR_OPTIONS.map((option) => {
                const selected = option.id === settings.appColor

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={option.label}
                    className={`app-color-picker__option ${
                      selected ? 'app-color-picker__option--selected' : ''
                    }`}
                    onClick={() => setAppColor(option.id)}
                  >
                    <span
                      className="app-color-picker__swatch"
                      style={{
                        background: `linear-gradient(135deg, ${option.swatches[0]}, ${option.swatches[1]})`,
                      }}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <span className="app-color-picker__check">✓</span>
                      ) : null}
                    </span>
                    <span className="app-color-picker__name">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="settings-panel__row">
            <div className="settings-panel__row-main">
              <SettingsSproutIcon className="settings-panel__icon" />
              <div className="settings-panel__copy">
                <span className="settings-panel__label">Companion</span>
                <span className="settings-panel__value">
                  {settings.companionEnabled
                    ? 'Preview — placeholder artwork'
                    : 'Off'}
                </span>
              </div>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                role="switch"
                className="settings-toggle__input"
                checked={settings.companionEnabled}
                onChange={toggleCompanion}
                aria-label={
                  settings.companionEnabled ? 'Hide the companion' : 'Show the companion'
                }
              />
              <span className="settings-toggle__track" aria-hidden="true">
                <span className="settings-toggle__thumb" />
              </span>
            </label>
          </div>

          <div className="settings-panel__row">
            <a
              href={APP_INFO.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-panel__link-row"
            >
              <div className="settings-panel__row-main">
                <SettingsStarIcon className="settings-panel__icon" />
                <span className="settings-panel__label settings-panel__label--inline">Rate app</span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron" />
            </a>
          </div>

          <div className="settings-panel__row">
            <a href={FEEDBACK_MAILTO} className="settings-panel__link-row">
              <div className="settings-panel__row-main">
                <SettingsFeedbackIcon className="settings-panel__icon" />
                <span className="settings-panel__label settings-panel__label--inline">
                  Give feedback
                </span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron" />
            </a>
          </div>

          <div className="settings-panel__row settings-panel__row--action">
            <button
              type="button"
              className="settings-panel__link-row"
              onClick={() => setShowAbout(true)}
            >
              <div className="settings-panel__row-main">
                <SettingsInfoIcon className="settings-panel__icon" />
                <span className="settings-panel__label settings-panel__label--inline">About</span>
              </div>
              <span className="settings-panel__aside">{APP_INFO.version}</span>
            </button>
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
                <span className="settings-panel__label settings-panel__label--inline">
                  Privacy policy
                </span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron" />
            </a>
          </div>

          <hr className="settings-panel__divider" />

          <div className="settings-panel__row settings-panel__row--action">
            <button
              type="button"
              className="settings-panel__link-row settings-panel__link-row--warning"
              onClick={() => setShowClearLeafuConfirm(true)}
            >
              <div className="settings-panel__row-main">
                <SettingsTrashIcon className="settings-panel__icon settings-panel__icon--warning" />
                <span className="settings-panel__label settings-panel__label--inline settings-panel__label--warning">
                  Clear Leafu data
                </span>
              </div>
              <SettingsChevronIcon className="settings-panel__chevron settings-panel__chevron--warning" />
            </button>
          </div>

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
        open={showAbout}
        title={`About ${APP_INFO.name}`}
        message={`${APP_INFO.tagline} Version ${APP_INFO.version}. Contact ${APP_INFO.contactEmail}.`}
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={() => setShowAbout(false)}
        onCancel={() => setShowAbout(false)}
      />

      <ConfirmDialog
        open={showClearLeafuConfirm}
        title="Clear Leafu data?"
        message="This removes Leafu consent, Shared Moments, and preferences on this device. Your habits and notes stay. You will need to enable Leafu again."
        confirmLabel={isClearingLeafu ? 'Clearing...' : 'Clear Leafu'}
        destructive
        confirmDisabled={isClearingLeafu}
        onConfirm={handleClearLeafuData}
        onCancel={() => setShowClearLeafuConfirm(false)}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all app data?"
        message="This will delete your habits, notes, Leafu data, profile session, and settings from this device. You will be signed out."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear data'}
        destructive
        confirmDisabled={isClearing}
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </AppLayout>
  )
}
