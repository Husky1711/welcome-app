import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import signInBackground from '../assets/sign-in-background.png'
import signInLogo from '../assets/sign-in-logo.png'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import {
  hasFieldErrors,
  validateLoginForm,
  type LoginFieldErrors,
} from '../utils/validators'
import '../styles/sign-in-page.css'

const FEATURE_CHIPS = [
  { id: 'habits', label: 'Habits', icon: LeafIcon },
  { id: 'notes', label: 'Notes', icon: NotesIcon },
  { id: 'today', label: 'Today', icon: SunIcon },
  { id: 'more', label: 'More', icon: GridIcon },
] as const

export function SignInPage() {
  const navigate = useNavigate()
  const { login, status, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})

  const isLoading = status === 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const validationErrors = validateLoginForm(email, password)
    setFieldErrors(validationErrors)

    if (hasFieldErrors(validationErrors)) {
      return
    }

    try {
      await login({ email: email.trim(), password })
      navigate(ROUTES.WELCOME, { replace: true })
    } catch {
      // Error state is handled by AuthContext
    }
  }

  return (
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
        <section className="sign-in-card" aria-labelledby="sign-in-heading">
          <div className="sign-in-card__content">
            <h2 id="sign-in-heading" className="sign-in-card__title">
              Sign in
            </h2>
            <p className="sign-in-card__subtitle">Continue to your personal dashboard</p>

            <form className="sign-in-form" onSubmit={handleSubmit} noValidate>
              {error ? (
                <div className="sign-in-form__alert" role="alert">
                  {error}
                </div>
              ) : null}

              <div className="field-wrap sign-in-form__field-1">
                <label className={`field ${fieldErrors.email ? 'field--error' : ''}`}>
                  <span className="sr-only">Email</span>
                  <span className="field__icon" aria-hidden="true">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    disabled={isLoading}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                {fieldErrors.email ? (
                  <p id="email-error" className="field-error" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="field-wrap sign-in-form__field-2">
                <label className={`field ${fieldErrors.password ? 'field--error' : ''}`}>
                  <span className="sr-only">Password</span>
                  <span className="field__icon" aria-hidden="true">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    disabled={isLoading}
                    aria-invalid={fieldErrors.password ? true : undefined}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="field__toggle"
                    disabled={isLoading}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide characters' : 'Show characters'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </label>
                {fieldErrors.password ? (
                  <p id="password-error" className="field-error" role="alert">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <button type="submit" className="sign-in-button" disabled={isLoading}>
                Sign in
              </button>
            </form>

            <p className="privacy-note">
              <span className="privacy-note__icon" aria-hidden="true">
                <LockIcon small />
              </span>
              <span>Your data is protected and private. Always.</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function LeafIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3C7 8 4 13 5 19c4-1 7-4 9-8 2 4 5 7 9 8 1-6-2-11-7-16-1 2-2 3-4 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NotesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
      <circle cx="18" cy="18" r="1.5" fill="currentColor" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon({ small = false }: { small?: boolean }) {
  const size = small ? 14 : 18
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
