import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import {
  hasFieldErrors,
  validateLoginForm,
  type LoginFieldErrors,
} from '../../utils/validators'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'

export function LoginForm() {
  const navigate = useNavigate()
  const { login, status, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        disabled={isLoading}
        error={fieldErrors.email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        value={password}
        disabled={isLoading}
        error={fieldErrors.password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" fullWidth loading={isLoading}>
        Sign in
      </Button>
    </form>
  )
}
