export interface LoginFieldErrors {
  email?: string
  password?: string
}

export function validateLoginForm(
  email: string,
  password: string,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}

export function hasFieldErrors(errors: LoginFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
