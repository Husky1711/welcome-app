import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-surface p-8 shadow-md">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </div>
  )
}
