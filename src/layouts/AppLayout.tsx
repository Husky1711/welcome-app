import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { BottomTabNav } from '../components/layout/BottomTabNav'
import { BOTTOM_NAV_VISIBLE_ROUTES } from '../constants/navigation'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  backTo?: string
  align?: 'center' | 'top'
  showBrand?: boolean
}

export function AppLayout({
  children,
  title,
  subtitle,
  backTo,
  align = 'center',
  showBrand = false,
}: AppLayoutProps) {
  const location = useLocation()
  const showBottomNav = BOTTOM_NAV_VISIBLE_ROUTES.includes(location.pathname)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {title ? (
        <AppHeader title={title} subtitle={subtitle} backTo={backTo} showBrand={showBrand} />
      ) : null}
      <main
        className={`flex flex-1 px-4 py-6 ${
          align === 'center' ? 'items-center justify-center' : 'items-start justify-center'
        } ${showBottomNav ? 'pb-32' : ''}`}
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
      {showBottomNav ? <BottomTabNav /> : null}
    </div>
  )
}
