import { Link, useLocation } from 'react-router-dom'
import { BOTTOM_NAV_TABS } from '../../constants/navigation'

export function BottomTabNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-surface/95 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-gray-700 dark:bg-surface/95 dark:shadow-none"
    >
      <div
        className="mx-auto flex max-w-md pb-[env(safe-area-inset-bottom)]"
        role="tablist"
      >
        {BOTTOM_NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.to

          return (
            <Link
              key={tab.to}
              to={tab.to}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
