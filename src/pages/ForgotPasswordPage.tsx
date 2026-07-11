import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { LockIcon, MailIcon } from '../components/auth/AuthIcons'
import { ROUTES } from '../constants/routes'
import { getAuthService } from '../services/auth/getAuthService'
import { AuthError } from '../types/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await getAuthService().sendPasswordReset({ email: email.trim() })
      setEmailSent(true)
    } catch (submitError) {
      setError(
        submitError instanceof AuthError
          ? submitError.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="sign-in-card" aria-labelledby="forgot-password-heading">
      <div className="sign-in-card__content">
        <h2 id="forgot-password-heading" className="sign-in-card__title">
          Reset password
        </h2>
        <p className="sign-in-card__subtitle">
          {emailSent
            ? 'Check your inbox for a password reset link.'
            : 'Enter the email linked to your account'}
        </p>

        {emailSent ? (
          <p className="auth-success" role="status">
            If an account exists for <strong>{email.trim()}</strong>, we sent reset
            instructions to that address.
          </p>
        ) : (
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
                disabled={isSubmitting}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button type="submit" className="sign-in-button" disabled={!email.trim() || isSubmitting}>
              Send reset link
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password?{' '}
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