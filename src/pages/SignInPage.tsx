import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, LockIcon, MailIcon } from '../components/auth/AuthIcons'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import {
  hasFieldErrors,
  validateLoginForm,
  type LoginFieldErrors,
} from '../utils/validators'

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

          <p className="auth-forgot-row">
            <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link auth-link--subtle">
              Forgot password?
            </Link>
          </p>

          <button type="submit" className="sign-in-button" disabled={isLoading}>
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.SIGN_UP} className="auth-link">
            Create account
          </Link>
        </p>

        <p className="privacy-note">
          <span className="privacy-note__icon" aria-hidden="true">
            <LockIcon small />
          </span>
          <span>Your data is protected and private. Always.</span>
        </p>
      </div>
    </section>
  )
}
