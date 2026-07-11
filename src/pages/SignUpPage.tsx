import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, LockIcon, MailIcon } from '../components/auth/AuthIcons'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export function SignUpPage() {
  const navigate = useNavigate()
  const { register, status, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isLoading = status === 'loading'
  const passwordsMatch = password === confirmPassword
  const passwordLongEnough = password.length >= 8
  const canSubmit =
    Boolean(email.trim()) && passwordLongEnough && Boolean(confirmPassword) && passwordsMatch

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    if (!canSubmit || isLoading) return

    try {
      await register({ email: email.trim(), password })
      navigate(ROUTES.WELCOME, { replace: true })
    } catch {
      // Error state is handled by AuthContext
    }
  }

  return (
    <section className="sign-in-card" aria-labelledby="signup-heading">
      <div className="sign-in-card__content">
        <h2 id="signup-heading" className="sign-in-card__title">
          Create account
        </h2>
        <p className="sign-in-card__subtitle">Use your email to sign in from now on</p>

        <form className="sign-in-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="sign-in-form__alert" role="alert">
              {error}
            </div>
          ) : null}

          <label className="field">
            <span className="sr-only">Email</span>
            <span className="field__icon" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              disabled={isLoading}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <p className="auth-hint">This will be your username</p>

          <label className="field">
            <span className="sr-only">Password</span>
            <span className="field__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <button
              type="button"
              className="field__toggle"
              disabled={isLoading}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </label>

          <label className="field">
            <span className="sr-only">Confirm password</span>
            <span className="field__icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={isLoading}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="field__toggle"
              disabled={isLoading}
              onClick={() => setShowConfirm((current) => !current)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </label>

          {confirmPassword && !passwordsMatch ? (
            <p className="auth-error" role="alert">
              Passwords do not match
            </p>
          ) : null}

          {password && !passwordLongEnough ? (
            <p className="auth-error" role="alert">
              Password must be at least 8 characters ({password.length}/8)
            </p>
          ) : (
            <p className="auth-hint">Use at least 8 characters</p>
          )}

          <button type="submit" className="sign-in-button" disabled={!canSubmit || isLoading}>
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="auth-link">
            Sign in
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
