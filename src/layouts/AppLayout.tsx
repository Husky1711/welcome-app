import type { ReactNode } from 'react'
import { AppHeader } from '../components/layout/AppHeader'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  backTo?: string
  align?: 'center' | 'top'
}

export function AppLayout({
  children,
  title,
  backTo,
  align = 'center',
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {title ? <AppHeader title={title} backTo={backTo} /> : null}
      <main
        className={`flex flex-1 px-4 py-8 ${
          align === 'center' ? 'items-center justify-center' : 'items-start justify-center'
        }`}
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
