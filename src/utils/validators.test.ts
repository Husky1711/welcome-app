import { describe, expect, it } from 'vitest'
import { hasFieldErrors, validateLoginForm } from './validators'

describe('validateLoginForm', () => {
  it('requires email and password', () => {
    const errors = validateLoginForm('', '')
    expect(errors.email).toBeTruthy()
    expect(errors.password).toBeTruthy()
    expect(hasFieldErrors(errors)).toBe(true)
  })

  it('accepts valid input', () => {
    const errors = validateLoginForm('admin@example.com', 'password123')
    expect(hasFieldErrors(errors)).toBe(false)
  })
})
