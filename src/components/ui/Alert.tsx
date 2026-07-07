type AlertVariant = 'error' | 'success'

interface AlertProps {
  variant?: AlertVariant
  children: string
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'border-error/20 bg-red-50 text-error',
  success: 'border-success/20 bg-green-50 text-success',
}

export function Alert({ variant = 'error', children }: AlertProps) {
  return (
    <div
      className={`rounded-md border px-3 py-2.5 text-sm ${variantClasses[variant]}`}
      role="alert"
      aria-live="polite"
    >
      {children}
    </div>
  )
}
