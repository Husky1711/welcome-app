import { Link, useLocation } from 'react-router-dom'
import { BOTTOM_NAV_TABS, type NavIconKey } from '../../constants/navigation'
import {
  CalendarNavIcon,
  HabitsNavIcon,
  HomeNavIcon,
  TodayNavIcon,
} from '../icons/NavIcons'

const NAV_ICONS: Record<NavIconKey, typeof HomeNavIcon> = {
  home: HomeNavIcon,
  today: TodayNavIcon,
  calendar: CalendarNavIcon,
  habits: HabitsNavIcon,
}

export function BottomTabNav() {
  const location = useLocation()

  return (
    <nav aria-label="Main navigation" className="bottom-nav">
      <div className="bottom-nav__pill" role="tablist">
        {BOTTOM_NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.to
          const Icon = NAV_ICONS[tab.icon]

          return (
            <Link
              key={tab.to}
              to={tab.to}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
            >
              <span className="bottom-nav__icon-wrap" aria-hidden="true">
                <Icon />
              </span>
              <span className="bottom-nav__label">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
