import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui/Spinner'

interface AuthBootstrapProps {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const { status } = useAuth()

  if (status === 'initializing') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <Spinner size="lg" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
